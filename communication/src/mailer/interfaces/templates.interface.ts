import { TemplateDelegate } from 'handlebars';
import { ITemplateData } from './template-data.interface';

export interface ITemplates {
  confirmation: TemplateDelegate<ITemplateData>;
  resetPassword: TemplateDelegate<ITemplateData>;
}
