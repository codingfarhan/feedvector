import { HttpException, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { isIP } from 'net';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';

const MAX_PAGES = 5;
const MAX_TEXT_PER_PAGE = 12_000;

type PageType =
  | 'homepage'
  | 'about'
  | 'caseStudyOrCustomers'
  | 'blogOrResources'
  | 'productOrServices'
  | 'pricing';

type ScrapedWebsitePage = {
  url: string;
  pageType: PageType;
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
};

const PAGE_PRIORITY = [
  {
    type: 'about',
    keywords: [
      'about',
      'about-us',
      'company',
      'our-story',
      'team',
      'who-we-are',
    ],
  },
  {
    type: 'caseStudyOrCustomers',
    keywords: [
      'case-studies',
      'case-study',
      'customers',
      'results',
      'success-stories',
      'testimonials',
    ],
  },
  {
    type: 'blogOrResources',
    keywords: ['blog', 'resources', 'insights', 'articles', 'guides', 'learn'],
  },
  {
    type: 'productOrServices',
    keywords: ['product', 'features', 'services', 'solutions', 'platform'],
  },
  {
    type: 'pricing',
    keywords: ['pricing', 'plans', 'subscriptions', 'packages'],
  },
] as const;

const FALLBACK_PATHS: Record<Exclude<PageType, 'homepage'>, string[]> = {
  about: ['/about', '/about-us', '/company', '/our-story'],
  caseStudyOrCustomers: [
    '/customers',
    '/case-studies',
    '/case-study',
    '/success-stories',
    '/testimonials',
  ],
  blogOrResources: ['/blog', '/resources', '/insights', '/articles', '/learn'],
  productOrServices: [
    '/product',
    '/features',
    '/services',
    '/solutions',
    '/platform',
  ],
  pricing: ['/pricing', '/plans', '/subscriptions'],
};

@Injectable()
export class OnboardingEnrichmentService {
  constructor(private _openaiService: OpenaiService) {}

  normalizeWebsiteUrl(input: string) {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new HttpException('Please enter a valid website URL', 400);
    }

    if (
      !/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i.test(
        trimmed
      )
    ) {
      throw new HttpException('Please enter a valid website URL', 400);
    }

    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new HttpException('Please enter a valid website URL', 400);
    }

    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
      isIP(hostname)
    ) {
      throw new HttpException('Please enter a public website URL', 400);
    }

    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(utm_|fbclid$|gclid$|msclkid$|ref$|ref_src$)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }

    url.hash = '';
    if (url.pathname !== '/') {
      url.pathname = url.pathname.replace(/\/+$/, '');
    }

    return {
      normalizedUrl: url.toString().replace(/\/$/, ''),
      origin: url.origin,
    };
  }

  async scrapeWebsite(input: string) {
    if (!process.env.BRIGHT_DATA_API_KEY) {
      throw new HttpException('Website scraping is not configured', 500);
    }

    const { normalizedUrl, origin } = this.normalizeWebsiteUrl(input);
    const homepageHtml = await this.fetchWithBrightData(normalizedUrl);
    const homepageParsed = this.parseWebsitePage(
      normalizedUrl,
      'homepage',
      homepageHtml,
      origin
    );

    if (homepageParsed.page.bodyText.length < 120) {
      throw new HttpException(
        'We could not read enough content from this website. Please enter another URL or leave it blank.',
        400
      );
    }

    const selected = this.selectPages(origin, homepageParsed.links);
    const pages: ScrapedWebsitePage[] = [homepageParsed.page];

    for (const page of selected) {
      if (pages.length >= MAX_PAGES) {
        break;
      }

      try {
        const html = await this.fetchWithBrightData(page.url);
        const parsed = this.parseWebsitePage(
          page.url,
          page.pageType,
          html,
          origin
        );
        if (parsed.page.bodyText.length >= 80) {
          pages.push(parsed.page);
        }
      } catch (err) {}
    }

    if (!pages.some((page) => page.bodyText.length >= 120)) {
      throw new HttpException(
        'We could not read enough content from this website. Please enter another URL or leave it blank.',
        400
      );
    }

    const profile = await this._openaiService.extractCompanyProfileFromWebsite(
      pages
    );
    if (!profile) {
      throw new HttpException(
        'We could not understand this website. Please enter another URL or leave it blank.',
        400
      );
    }

    return {
      normalizedUrl,
      pages,
      profile,
    };
  }

  async enrichLinkedinProfile(profile?: string | null) {
    if (!process.env.RAPIDAPI_KEY) {
      throw new HttpException(
        'LinkedIn profile enrichment is not configured',
        500
      );
    }

    const linkedinUrl = this.linkedinProfileUrl(profile);
    if (!linkedinUrl) {
      throw new HttpException(
        'Refresh your LinkedIn connection before completing onboarding',
        400
      );
    }

    const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/enrich-lead?linkedin_url=${encodeURIComponent(
      linkedinUrl
    )}&include_skills=true&include_certifications=true&include_profile_status=false&include_company_public_url=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new HttpException(
        'Could not enrich your LinkedIn profile. Please try again.',
        400
      );
    }

    const result = await response.json();
    const data = result?.data || result;
    const context = await this.normalizeLinkedinProfile(data, linkedinUrl);
    return context;
  }

  private async fetchWithBrightData(url: string) {
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone: process.env.BRIGHT_DATA_ZONE || 'web_unlocker1',
        url,
        format: 'json',
        method: 'GET',
        country: 'US',
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Bright Data request failed: ${response.status}`);
    }

    const text = await response.text();

    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed?.status_code === 'number' &&
        parsed.status_code !== 200
      ) {
        throw new Error(
          `Bright Data could not scrape ${url}: ${parsed.status_code}`
        );
      }

      const body =
        parsed?.body ||
        parsed?.content ||
        parsed?.html ||
        parsed?.data?.body ||
        parsed?.data?.content ||
        parsed?.response?.body;
      return typeof body === 'string' ? body : text;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.startsWith('Bright Data could not scrape')
      ) {
        throw err;
      }

      return text;
    }
  }

  private parseWebsitePage(
    url: string,
    pageType: PageType,
    html: string,
    origin: string
  ) {
    const $ = cheerio.load(html);
    $('script, style, noscript, svg, iframe').remove();

    const title = this.cleanText($('title').first().text()).slice(0, 220);
    const metaDescription = this.cleanText(
      $('meta[name="description"]').attr('content') || ''
    ).slice(0, 500);
    const headings = $('h1, h2, h3')
      .map((_, element) => this.cleanText($(element).text()))
      .get()
      .filter(Boolean)
      .slice(0, 30);

    const bodyText = this.cleanText($('body').text()).slice(
      0,
      MAX_TEXT_PER_PAGE
    );
    const links = $('a[href]')
      .map((_, element) => {
        const href = $(element).attr('href');
        if (!href) {
          return null;
        }

        const normalized = this.normalizeInternalLink(href, origin);
        if (!normalized) {
          return null;
        }

        return {
          url: normalized,
          text: this.cleanText($(element).text()).slice(0, 160),
        };
      })
      .get()
      .filter(Boolean) as Array<{ url: string; text: string }>;

    return {
      page: {
        url,
        pageType,
        title,
        metaDescription,
        headings,
        bodyText,
      },
      links,
    };
  }

  private selectPages(
    origin: string,
    links: Array<{ url: string; text: string }>
  ) {
    const selected = new Map<
      string,
      { url: string; pageType: Exclude<PageType, 'homepage'>; score: number }
    >();

    for (const link of links) {
      for (const priority of PAGE_PRIORITY) {
        const search = `${link.url} ${link.text}`.toLowerCase();
        const score = priority.keywords.reduce(
          (total, keyword) => total + (search.includes(keyword) ? 1 : 0),
          0
        );
        if (!score) {
          continue;
        }

        const existing = selected.get(priority.type);
        if (!existing || score > existing.score) {
          selected.set(priority.type, {
            url: link.url,
            pageType: priority.type,
            score,
          });
        }
      }
    }

    for (const priority of PAGE_PRIORITY) {
      if (selected.has(priority.type)) {
        continue;
      }

      for (const path of FALLBACK_PATHS[priority.type]) {
        selected.set(priority.type, {
          url: new URL(path, origin).toString().replace(/\/$/, ''),
          pageType: priority.type,
          score: 0,
        });
        break;
      }
    }

    const seenUrls = new Set([origin, `${origin}/`]);
    return PAGE_PRIORITY.map((priority) => selected.get(priority.type))
      .filter(Boolean)
      .filter((page) => {
        if (seenUrls.has(page!.url)) {
          return false;
        }

        seenUrls.add(page!.url);
        return true;
      })
      .slice(0, MAX_PAGES - 1) as Array<{
      url: string;
      pageType: Exclude<PageType, 'homepage'>;
      score: number;
    }>;
  }

  private normalizeInternalLink(href: string, origin: string) {
    try {
      const url = new URL(href, origin);
      if (
        url.origin !== origin ||
        !['http:', 'https:'].includes(url.protocol)
      ) {
        return undefined;
      }

      url.hash = '';
      for (const key of Array.from(url.searchParams.keys())) {
        if (/^(utm_|fbclid$|gclid$|msclkid$|ref$|ref_src$)/i.test(key)) {
          url.searchParams.delete(key);
        }
      }

      return url.toString().replace(/\/$/, '');
    } catch {
      return undefined;
    }
  }

  private cleanText(text: string) {
    return text.replace(/\s+/g, ' ').trim();
  }

  private linkedinProfileUrl(profile?: string | null) {
    if (!profile) {
      return '';
    }

    if (profile.startsWith('http')) {
      return profile;
    }

    return `https://www.linkedin.com/in/${profile.replace(/^@/, '')}/`;
  }

  private async normalizeLinkedinProfile(data: any, linkedinUrl: string) {
    const experiences = (data?.experiences || []).map((experience: any) => ({
      title: String(experience.title || ''),
      company: String(experience.company || ''),
      summary: experience.description || undefined,
      startYear: this.numberOrUndefined(experience.start_year),
      endYear: this.numberOrUndefined(experience.end_year),
    }));

    const currentExperience =
      (data?.experiences || []).find(
        (experience: any) => experience.is_current
      ) ||
      (data?.experiences || [])[0] ||
      {};
    const skills =
      typeof data?.skills === 'string'
        ? data.skills
            .split('|')
            .map((skill: string) => skill.trim())
            .filter(Boolean)
        : data?.skills || [];
    const educationHighlights = (data?.educations || [])
      .map((education: any) =>
        [education.degree, education.field_of_study, education.school]
          .filter(Boolean)
          .join(', ')
      )
      .filter(Boolean);

    const compactProfile = {
      fullName: data?.full_name,
      headline: data?.headline,
      about: data?.about,
      location:
        data?.location ||
        [data?.city, data?.state, data?.country].filter(Boolean).join(', '),
      currentRole: {
        title: currentExperience.title || data?.job_title,
        company: currentExperience.company || data?.company,
        industry: data?.company_industry,
        description: currentExperience.description,
      },
      skills: skills.slice(0, 60),
      experiences: experiences.slice(0, 10),
      educationHighlights: educationHighlights.slice(0, 8),
      certifications: (data?.certifications || []).slice(0, 8),
      company: {
        companyName: data?.company,
        description: data?.company_description,
        industry: data?.company_industry,
        website: data?.company_website,
        employeeRange: data?.company_employee_range,
      },
    };
    const aiContext = await this._openaiService.extractLinkedinProfileAiContext(
      compactProfile
    );

    return {
      fullName: data?.full_name || '',
      headline: data?.headline || '',
      about: data?.about || '',
      location:
        data?.location ||
        [data?.city, data?.state, data?.country].filter(Boolean).join(', ') ||
        undefined,
      linkedinUrl: data?.linkedin_url || linkedinUrl,
      currentRole: {
        title: currentExperience.title || data?.job_title || '',
        company: currentExperience.company || data?.company || '',
        industry: data?.company_industry || undefined,
        description: currentExperience.description || undefined,
      },
      skills,
      experiences,
      educationHighlights,
      professionalSummary: aiContext.professionalSummary,
      expertiseAreas: aiContext.expertiseAreas,
      credibilityPoints: aiContext.credibilityPoints,
      contentAngles: aiContext.contentAngles,
      audienceSignals: aiContext.audienceSignals,
    };
  }

  private numberOrUndefined(value: any) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : undefined;
  }
}
