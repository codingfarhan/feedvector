import {
  LINKEDIN_POST_TEMPLATES,
  type PillarCategory,
} from '@gitroom/nestjs-libraries/onboarding/linkedin.post.templates';

export type Template = {
  id: string;
  platform: 'linkedin';
  category: PillarCategory;
  categories: PillarCategory[];
  title: string;
  template: string;
  example: string;
};

const variablePreview = (variables: string[]) => {
  if (!variables.length) {
    return 'Use this structure as-is, then add your own context and specifics.';
  }

  return `Fill these variables:\n${variables
    .map((item) => `- ${item}`)
    .join('\n')}`;
};

export const templates: Template[] = LINKEDIN_POST_TEMPLATES.map(
  (template) => ({
    id: template.id,
    platform: 'linkedin',
    category: template.bestForPillars[0],
    categories: template.bestForPillars,
    title: template.name,
    template: template.template,
    example: variablePreview(template.variables),
  })
);

export const categories = [
  'All',
  ...Array.from(
    new Set(
      LINKEDIN_POST_TEMPLATES.flatMap((template) => template.bestForPillars)
    )
  ).sort(),
];
