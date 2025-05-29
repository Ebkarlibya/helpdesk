import { Component } from "vue";

export interface Resource<T = unknown> {
  auto: boolean;
  loading: boolean;
  data: T;
  pageLength: number;
  totalCount: number;
  hasNextPage: boolean;
  list: {
    loading: boolean;
  };
  next: () => void;
  reload: () => void;
  update: (r: unknown) => void;
}

export interface Error {
  exc_type: string;
  exc: string;
  response: string;
  status: string;
  messages: string;
  stack: string;
  message: string;
}

export interface Comment {
  commented_by: string;
  content: string;
  is_pinned: boolean;
  name: string;
  creation: string;
}

export interface Communication {
  creation: string;
  subject: string;
  content: string;
  name: string;
  isLastEmail: boolean;
  sender: string;
  bcc?: string;
  cc?: string;
}

export interface Activity {
  action: string;
  subject: string;
  sender: string;
  to: string;
  cc: string;
  bcc: string;
  attachments: FileAttachment[];
  content: string;
  name: string;
  isLastEmail: boolean;
  owner: string;
  creation: string;
}

export interface Contact {
  full_name: string;
  name: string;
  company_name?: string;
  email_id?: string;
  image?: string;
  mobile_no?: string;
  phone?: string;
}

export interface CustomField {
  fieldname: string;
  label: string;
  value: string;
  route: string;
}

export interface ViewLog {
  name: string;
  viewed_by: string;
  creation: string;
}

export interface Ticket {
  _assign: string;
  assignee: UserInfo;
  agent_group: string;
  customer: string;
  modified: string;
  name: string;
  priority: string;
  raised_by: string;
  resolution_by: string;
  response_by: string;
  first_responded_on: string;
  resolution_date: string;
  status: string;
  ehda_non_sla_form: string;
  ehda_non_sla_status: string;
  ehda_non_sla_form_project: string;
  ehda_telegram_recent_msg_id: string;
  ehda_etms_erp_site: string;
  subject: string;
  ticket_type: string;
  via_customer_portal: string;
  agreement_status: string;
  creation: string;
  feedback_rating?: number;
  feedback_text?: string;
  feedback_extra?: string;
  sla: string;
  sla_description: string;
  contact: Contact;
  comments: Comment[];
  communications: Communication[];
  history: Activity[];
  template: Template;
  views: ViewLog[];
  _customActions: Function[];
  is_merged?: boolean;
}

export interface NonSLAEvalForm {
  name: string
  owner: string
  creation: string
  modified: string
  modified_by: string
  docstatus: number
  idx: number
  naming_series: string
  workflow_state: string
  related_quotation: string
  related_ticket_id: number
  related_ticket_creation_date: string
  related_hd_customer: string
  related_ticket_subject: string
  description: string
  employee: string
  assigned_evaluator_name: string
  assigned_evaluator_email: string
  doctype: string
  type_of_non_sla_request: TypeOfNonSlaRequest[]
  cancellation_reason: CancellationReason[]
  quotation_rejection_reason: QuotationRejectionReason[]
  related_project: string
  meeting_with_customer_details_if_any: string
  estimated_effort_in_hours: string
  can_it_be_reused: string
  urgency_from_customer: string
  technical_complexity: string
  impact_scope: string
  additional_notes: string
}

export interface TypeOfNonSlaRequest {
  docstatus: number
  doctype: string
  name: string
  __unsaved: number
  owner: string
  parent: string
  parentfield: string
  parenttype: string
  idx: number
  type_of_non_sla_request: string
  creation: string
  modified: string
  modified_by: string
}

export interface CancellationReason {
  docstatus: number
  doctype: string
  name: string
  __unsaved: number
  owner: string
  parent: string
  parentfield: string
  parenttype: string
  idx: number
  link_afkn: string
  creation: string
  modified: string
  modified_by: string
}

export interface QuotationRejectionReason {
  docstatus: number
  doctype: string
  name: string
  __unsaved: number
  owner: string
  parent: string
  parentfield: string
  parenttype: string
  idx: number
  link_kyjp: string
  creation: string
  modified: string
  modified_by: string
}

export interface DocField {
  fieldname: string;
  fieldtype: string;
  label: string;
  name: string;
  options: string;
}

export interface Filter {
  field?: DocField;
  fieldname: string;
  operator: string;
  label: string;
  value: boolean | number | string;
}

export interface AutoCompleteItem {
  label: string;
  value: string;
}

export interface Field {
  fieldname: string;
  fieldtype: string;
  hide_from_customer: 0 | 1;
  label: string;
  options: string;
  required: 0 | 1;
  description?: null;
  url_method?: string;
  link_filters?: string;
  filters?: string;
  display_via_depends_on?: string;
  mandatory_via_depends_on?: string;
}

export type FieldValue = string | number | boolean;

export interface Template {
  about: string;
  fields: Field[];
}

export type Column = {
  key: string;
  label: string;
  icon?: string;
  align?: string;
  width?: string;
  text?: string;
};

export type File = {
  file_name: string;
  name: string;
  file_url: string;
  is_private: boolean;
  attached_to_doctype?: string;
  attached_to_field?: string;
  attached_to_name?: string;
};

export type Notification = {
  creation: string;
  name: string;
  notification_type: string;
  read: boolean;
  reference_comment: string;
  reference_ticket: string;
  user_from: UserInfo;
  user_to: UserInfo;
};

export type UserInfo = {
  email: string;
  image: string;
  name: string;
};

export interface RenderField {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  description?: string;
}

export interface EmailService {
  name: string;
  icon: string;
  info: string;
  link: string;
  custom: boolean;
}

export type EmailStep = "email-list" | "email-add" | "email-edit";

export interface EmailAccount {
  email_account_name: string;
  email_id: string;
  service: string;
  api_key?: string;
  api_secret?: string;
  password?: string;
  frappe_mail_site?: string;
  enable_outgoing?: boolean;
  enable_incoming?: boolean;
  default_outgoing?: boolean;
  default_incoming?: boolean;
}

export type TicketTab = "activity" | "email" | "comment" | "details";

export interface TabObject {
  name: TicketTab;
  label: string;
  icon: Component;
  condition?: () => boolean;
}

export interface RootCategory {
  category_id: string;
  category_name: string;
}

export interface Article {
  name: string;
  title: string;
  category_name: string;
  category_id: string;
  published_on: string;
  author: Author;
  subtitle: string;
  article_image: string | null;
  _user_tags: string | null;
  status: string;
  creation: string;
  content: string;
  modified: string;
  feedback: FeedbackAction;
}

export type FeedbackAction = 0 | 1 | 2; // 0: neutral, 1: like, 2: dislike

export interface Author {
  name: string;
  image: string | null;
  email: string;
}

export interface Category {
  categoryName: string;
  articles: Article[];
  authors?: {
    [key: string]: Author;
  };
  children?: Article[];
}

export interface View {
  filters: string;
  order_by: string;
  columns: string;
  rows: string;
  dt?: string;
  type?: string;
  route_name?: string;
  user?: string;
  icon?: string;
  label?: string;
  is_default?: boolean;
  pinned?: boolean;
  public?: boolean;
  group_by_field?: string;
  name?: string;
  is_customer_portal?: boolean;
}

export interface ViewType {
  view_type: string;
  group_by_field: string;
  name: string;
}

export interface Breadcrumb {
  label: string;
  route?: {
    name: string;
    params?: Record<string, string>;
  };
}

// Activity Types
interface BaseActivity {
  type: string;
  key: string;
  creation: string;
  content: string;
}

interface HistoryActivity extends BaseActivity {
  type: "history";
  user: string;
  relatedActivities: HistoryActivity[];
}

export interface EmailActivity extends BaseActivity {
  type: "email";
  attachments: FileAttachment;
  bcc: string;
  cc: string;
  name: string;
  sender: { full_name: string; name: string };
  subject: string;
  to: string;
  isFirstEmail: boolean;
}

export interface CommentActivity extends BaseActivity {
  type: "comment";
  name: string;
  commenter: string;
  commentedBy: string;
  attachments: FileAttachment[];
}

export type TicketActivity = HistoryActivity | EmailActivity | CommentActivity;

interface FileAttachment {
  name: string;
  file_name: string;
  file_url: string;
}
