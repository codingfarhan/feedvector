import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { shuffle } from 'lodash';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
});

const PicturePrompt = z.object({
  prompt: z.string(),
});

const VoicePrompt = z.object({
  voice: z.string(),
});

const CompanyProfilePrompt = z.object({
  companyName: z.string().nullable(),
  description: z.string(),
  industry: z.string().nullable(),
  targetAudience: z.array(z.string()),
  keyProducts: z.array(z.string()),
  keyFeatures: z.array(z.string()),
  customerPainPoints: z.array(z.string()),
  proofPoints: z.array(z.string()),
  brandTone: z.string(),
  founderOrCompanyStory: z.string().nullable(),
  contentAngles: z.array(z.string()),
  pricingSummary: z.string().nullable(),
});

const LinkedinProfileContextPrompt = z.object({
  professionalSummary: z.string(),
  expertiseAreas: z.array(z.string()),
  credibilityPoints: z.array(z.string()),
  contentAngles: z.array(z.string()),
  audienceSignals: z.array(z.string()),
});

const OnboardingGeneratedPostPrompt = z.object({
  templateId: z.string(),
  content: z.string(),
});

const OnboardingGeneratedPostsPrompt = z.object({
  posts: z.array(OnboardingGeneratedPostPrompt),
});

const RepurposedLinkedinPostPrompt = z.object({
  content: z.string(),
  pillar: z.string(),
  angle: z.string(),
});

export const LINKEDIN_HUMAN_WRITING_GUIDELINES = `
Write in clear, natural language. Never use em dashes.

Avoid AI cliches, corporate jargon, vague hype, exaggerated claims, generic metaphors, fake drama, and unnecessary rhetorical questions.

Avoid words and phrases such as: unlock, unleash, elevate, delve, deep dive, navigate, robust, seamless, cutting-edge, game-changer, supercharge, revolutionize, harness, foster, crucial, compelling, resonate, secret sauce, scroll-stopper, moves the needle, here's the truth, here's the deal, here's the kicker, picture this, in today's fast-paced world, in today's era, in the era of, in the digital age, and let's dive in.

Avoid templated sentence patterns such as:
- "It's not about X. It's about Y."
- "It's not just X. It's Y."
- "That's not X. That's Y."
- "Not because X. But because Y."
- "Not by doing X, but by doing Y."
- "No X. No Y. Just Z."
- "Focused. Simple. Effective."
- "The result? Higher engagement."
- "And the solution? Better content."
- Repeated one- or two-word sentences used for artificial emphasis.

Do not use unnecessary analogies such as calling marketing a battlefield, chess match, journey, engine, secret weapon, or perfect storm.

Prefer plain words, concrete details, varied sentence lengths, normal paragraph structure, specific examples, and direct opinions.

Do not invent personal stories, customer quotes, results, numbers, lessons, or experiences. Every factual or personal claim must come from the provided context.

Write like an informed person explaining something clearly, not like a motivational speaker or marketing template.
`.trim();

export const LINKEDIN_ANALYTICS_HOOK_STYLES = [
  'Question-led',
  'Contrarian statement',
  'Problem diagnosis',
  'Direct statement',
  'Story-led',
  'Personal observation',
  'Result-led',
  'Before / after',
  'Process breakdown',
  'List-led',
  'Data/stat-led',
  'Mistake/confession',
  'Prediction/trend',
  'Quote/borrowed insight',
] as const;

export const LINKEDIN_ANALYTICS_TOPICS = [
  'Sales and revenue',
  'Marketing and content',
  'Product and service',
  'Operations and systems',
  'Leadership and management',
  'Hiring and culture',
  'Founder journey',
  'Career and professional growth',
  'Customer insights',
  'Industry trends',
  'Personal productivity',
  'Case studies and proof',
  'Opinion and commentary',
] as const;

const LinkedinAnalyticsPostClassificationPrompt = z.object({
  classifications: z.array(
    z.object({
      id: z.string(),
      hookStyle: z.enum(LINKEDIN_ANALYTICS_HOOK_STYLES),
      topic: z.enum(LINKEDIN_ANALYTICS_TOPICS),
      confidence: z.enum(['Low', 'Medium', 'High']),
    })
  ),
});

@Injectable()
export class OpenaiService {
  async generateImage(prompt: string, isUrl: boolean, isVertical = false) {
    const generate = (
      await openai.images.generate({
        prompt,
        response_format: isUrl ? 'url' : 'b64_json',
        model: 'dall-e-3',
        ...(isVertical ? { size: '1024x1792' } : {}),
      })
    ).data[0];

    return isUrl ? generate.url : generate.b64_json;
  }

  async generatePromptForPicture(prompt: string) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: `You are an assistant that take a description and style and generate a prompt that will be used later to generate images, make it a very long and descriptive explanation, and write a lot of things for the renderer like, if it${"'"}s realistic describe the camera`,
            },
            {
              role: 'user',
              content: `prompt: ${prompt}`,
            },
          ],
          response_format: zodResponseFormat(PicturePrompt, 'picturePrompt'),
        })
      ).choices[0].message.parsed?.prompt || ''
    );
  }

  async generateVoiceFromText(prompt: string) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: `You are an assistant that takes a social media post and convert it to a normal human voice, to be later added to a character, when a person talk they don\'t use "-", and sometimes they add pause with "..." to make it sounds more natural, make sure you use a lot of pauses and make it sound like a real person`,
            },
            {
              role: 'user',
              content: `prompt: ${prompt}`,
            },
          ],
          response_format: zodResponseFormat(VoicePrompt, 'voice'),
        })
      ).choices[0].message.parsed?.voice || ''
    );
  }

  async generatePosts(content: string) {
    const posts = (
      await Promise.all([
        openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content:
                'Generate a Twitter post from the content without emojis in the following JSON format: { "post": string } put it in an array with one element',
            },
            {
              role: 'user',
              content: content!,
            },
          ],
          n: 5,
          temperature: 1,
          model: 'gpt-4.1',
        }),
        openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content:
                'Generate a thread for social media in the following JSON format: Array<{ "post": string }> without emojis',
            },
            {
              role: 'user',
              content: content!,
            },
          ],
          n: 5,
          temperature: 1,
          model: 'gpt-4.1',
        }),
      ])
    ).flatMap((p) => p.choices);

    return shuffle(
      posts.map((choice) => {
        const { content } = choice.message;
        const start = content?.indexOf('[')!;
        const end = content?.lastIndexOf(']')!;
        try {
          return JSON.parse(
            '[' +
              content
                ?.slice(start + 1, end)
                .replace(/\n/g, ' ')
                .replace(/ {2,}/g, ' ') +
              ']'
          );
        } catch (e) {
          return [];
        }
      })
    );
  }
  async extractWebsiteText(content: string) {
    const websiteContent = await openai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You take a full website text, and extract only the article content',
        },
        {
          role: 'user',
          content,
        },
      ],
      model: 'gpt-4.1',
    });

    const { content: articleContent } = websiteContent.choices[0].message;

    return this.generatePosts(articleContent!);
  }

  async extractCompanyProfileFromWebsite(pages: any[]) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content:
                'You extract company positioning from cleaned website text for LinkedIn personal-brand content generation. Return strict JSON only. Be concise, factual, and do not invent specifics that are not supported by the pages.',
            },
            {
              role: 'user',
              content: JSON.stringify({ pages }),
            },
          ],
          response_format: zodResponseFormat(
            CompanyProfilePrompt,
            'companyProfile'
          ),
        })
      ).choices[0].message.parsed || null
    );
  }

  async extractLinkedinProfileAiContext(profile: any) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content:
                'You extract a LinkedIn profile context for personal-brand content generation. Return strict JSON only. Base every field on the supplied profile data and avoid unsupported claims.',
            },
            {
              role: 'user',
              content: JSON.stringify({ profile }),
            },
          ],
          response_format: zodResponseFormat(
            LinkedinProfileContextPrompt,
            'linkedinProfileContext'
          ),
        })
      ).choices[0].message.parsed || {
        professionalSummary: '',
        expertiseAreas: [],
        credibilityPoints: [],
        contentAngles: [],
        audienceSignals: [],
      }
    );
  }

  async generateOnboardingLinkedinPosts(input: {
    role: string;
    audience: string;
    goal: string;
    campaignInstructions?: string[];
    linkedinProfileContext: any;
    websiteProfile?: any;
    templates: Array<{
      id: string;
      name: string;
      pillar: string;
      archetype?: string;
      hookStyles?: string[];
      tensionPattern?: string;
      intents?: string[];
      openingPattern?: string;
      template: string;
      variables: string[];
      ctaOptions: Array<{
        id: string;
        action: string;
        intensity: string;
        text: string;
      }>;
      proofRequirement: string;
      generationInstructions?: string[];
      antiPatterns: string[];
    }>;
  }) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: [
                'You write concise LinkedIn posts for onboarding. Use each supplied template as a structural guide for the angle, pillar, and rough flow, but do not copy awkward template phrasing verbatim when it conflicts with the writing guidelines. Fill the post with specific, believable details from the provided profile/context. Return strict JSON only. Do not invent metrics, clients, revenue, employers, job offers, or proof. Do not leave placeholders like [audience] in the output. Do not add hashtags. Each template includes CTA options with id, action, intensity, and text. Choose one CTA option and lightly adapt its wording so it relates to the post topic and audience. Preserve the selected CTA action exactly: comment CTAs must ask for a comment, dm CTAs must ask for a DM, connect CTAs must ask to connect, follow CTAs must ask to follow or keep an eye on future work, apply CTAs must invite applying or reaching out, view_product CTAs must point to the product/service, request_resource CTAs must ask for a resource request, share_example CTAs must ask for an example, and reflect CTAs must stay reflective. Do not make the CTA stronger than its intensity allows. Keep the adapted CTA to one sentence. Do not invent a resource, demo, product, or offer unless it is present in the CTA text or supplied context.',
                'The supplied posts are a set, not isolated drafts. Make the full set feel like a weekly campaign with varied structures. Do not reuse the same opening pattern, list format, hook style, sentence rhythm, or CTA style across the posts unless the template explicitly requires it.',
                'Use each template metadata field to guide variety: archetype, hookStyles, tensionPattern, intents, openingPattern, and generationInstructions.',
                LINKEDIN_HUMAN_WRITING_GUIDELINES,
              ].join('\n\n'),
            },
            {
              role: 'user',
              content: JSON.stringify(input),
            },
          ],
          response_format: zodResponseFormat(
            OnboardingGeneratedPostsPrompt,
            'onboardingGeneratedPosts'
          ),
        })
      ).choices[0].message.parsed?.posts || []
    );
  }

  async generateRepurposedLinkedinPost(input: {
    sourceType: 'website' | 'past_posts' | 'profile';
    role: string;
    audience: string;
    goal: string;
    allowedPillars: string[];
    additionalContext?: string;
    visualContext?: string;
    websiteProfile?: any;
    websitePages?: any[];
    selectedPosts?: Array<{
      label: string;
      date?: string;
      total?: number;
    }>;
    linkedinProfileContext?: any;
    profileFocus?: string;
  }) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: [
                'You write one concise LinkedIn post by repurposing user-provided source material. Return strict JSON only. Choose the best pillar from allowedPillars and include it in the pillar field. The post should feel like it was written by the user for their audience and goal. Do not invent metrics, clients, employers, testimonials, certifications, revenue, results, or proof. If the source is thin, write from the available context and keep claims conservative. Do not add hashtags. Use the optional visualContext only as creative context; do not say an image is attached. Keep the CTA contextual, low-friction, and aligned with the goal.',
                LINKEDIN_HUMAN_WRITING_GUIDELINES,
              ].join('\n\n'),
            },
            {
              role: 'user',
              content: JSON.stringify(input),
            },
          ],
          response_format: zodResponseFormat(
            RepurposedLinkedinPostPrompt,
            'repurposedLinkedinPost'
          ),
        })
      ).choices[0].message.parsed || {
        content: '',
        pillar: '',
        angle: '',
      }
    );
  }

  async classifyLinkedinAnalyticsPosts(input: {
    posts: Array<{
      id: string;
      text: string;
    }>;
  }) {
    return (
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          temperature: 0,
          messages: [
            {
              role: 'system',
              content:
                'You classify LinkedIn posts for analytics. Return strict JSON only. For each post, choose exactly one hookStyle and exactly one topic from the allowed enum values. Use the hookStyle to describe how the opening of the post attracts attention. Use the topic to describe the main subject of the post. Do not invent categories.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                hookStyles: LINKEDIN_ANALYTICS_HOOK_STYLES,
                topics: LINKEDIN_ANALYTICS_TOPICS,
                posts: input.posts.map((post) => ({
                  id: post.id,
                  text: post.text.slice(0, 1800),
                })),
              }),
            },
          ],
          response_format: zodResponseFormat(
            LinkedinAnalyticsPostClassificationPrompt,
            'linkedinAnalyticsPostClassification'
          ),
        })
      ).choices[0].message.parsed?.classifications || []
    );
  }

  async separatePosts(content: string, len: number) {
    const SeparatePostsPrompt = z.object({
      posts: z.array(z.string()),
    });

    const SeparatePostPrompt = z.object({
      post: z.string().max(len),
    });

    const posts =
      (
        await openai.chat.completions.parse({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: `You are an assistant that take a social media post and break it to a thread, each post must be minimum ${
                len - 10
              } and maximum ${len} characters, keeping the exact wording and break lines, however make sure you split posts based on context`,
            },
            {
              role: 'user',
              content: content,
            },
          ],
          response_format: zodResponseFormat(
            SeparatePostsPrompt,
            'separatePosts'
          ),
        })
      ).choices[0].message.parsed?.posts || [];

    return {
      posts: await Promise.all(
        posts.map(async (post: any) => {
          if (post.length <= len) {
            return post;
          }

          let retries = 4;
          while (retries) {
            try {
              return (
                (
                  await openai.chat.completions.parse({
                    model: 'gpt-4.1',
                    messages: [
                      {
                        role: 'system',
                        content: `You are an assistant that take a social media post and shrink it to be maximum ${len} characters, keeping the exact wording and break lines`,
                      },
                      {
                        role: 'user',
                        content: post,
                      },
                    ],
                    response_format: zodResponseFormat(
                      SeparatePostPrompt,
                      'separatePost'
                    ),
                  })
                ).choices[0].message.parsed?.post || ''
              );
            } catch (e) {
              retries--;
            }
          }

          return post;
        })
      ),
    };
  }

  async generateSlidesFromText(text: string) {
    for (let i = 0; i < 3; i++) {
      try {
        const message = `You are an assistant that takes a text and break it into slides, each slide should have an image prompt and voice text to be later used to generate a video and voice, image prompt should capture the essence of the slide and also have a back dark gradient on top, image prompt should not contain text in the picture, generate between 3-5 slides maximum`;
        const parse =
          (
            await openai.chat.completions.parse({
              model: 'gpt-4.1',
              messages: [
                {
                  role: 'system',
                  content: message,
                },
                {
                  role: 'user',
                  content: text,
                },
              ],
              response_format: zodResponseFormat(
                z.object({
                  slides: z
                    .array(
                      z.object({
                        imagePrompt: z.string(),
                        voiceText: z.string(),
                      })
                    )
                    .describe('an array of slides'),
                }),
                'slides'
              ),
            })
          ).choices[0].message.parsed?.slides || [];

        return parse;
      } catch (err) {
        console.log(err);
      }
    }

    return [];
  }
}
