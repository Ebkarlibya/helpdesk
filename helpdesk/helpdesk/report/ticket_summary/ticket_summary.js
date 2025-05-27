// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Ticket Summary"] = {
  filters: [
    {
      fieldname: "based_on",
      label: __("Based On"),
      fieldtype: "Select",
      options: ["Contact", "Ticket Type", "Ticket Priority", "Assigned To"],
      default: "Contact",
      reqd: 1,
    },
    {
      fieldname: "from_date",
      label: __("From Date"),
      fieldtype: "Date",
      default: frappe.defaults.get_global_default("year_start_date"),
      reqd: 1,
    },
    {
      fieldname: "to_date",
      label: __("To Date"),
      fieldtype: "Date",
      default: frappe.defaults.get_global_default("year_end_date"),
      reqd: 1,
    },
    {
      fieldname: "status",
      label: __("Status"),
      fieldtype: "Select",
      options: [
        "",
        { label: __("New"), value: "New" },
        { label: __("Under Review"), value: "Under Review" },
        { label: __("Awaiting Customer Info"), value: "Awaiting Customer Info" },
        { label: __("Customer Responded"), value: "Customer Responded" },
        { label: __("Work in Progress"), value: "Work in Progress" },
        { label: __("Non-SLA – Transferred for Evaluation"), value: "Non-SLA – Transferred for Evaluation" },
        { label: __("Transferred to Project Tracker"), value: "Transferred to Project Tracker" },
        { label: __("Resolved"), value: "Resolved" },
        { label: __("Closed"), value: "Closed" },
        { label: __("Cancelled"), value: "Cancelled" },
      ],
    },
    {
      fieldname: "priority",
      label: __("Ticket Priority"),
      fieldtype: "Link",
      options: "HD Ticket Priority",
    },
    {
      fieldname: "contact",
      label: __("Contact"),
      fieldtype: "Link",
      options: "Contact",
    },
    {
      fieldname: "assigned_to",
      label: __("Assigned To"),
      fieldtype: "Link",
      options: "User",
    },
  ],
};
