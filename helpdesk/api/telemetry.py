import frappe
from frappe.utils.telemetry import POSTHOG_HOST_FIELD, POSTHOG_PROJECT_FIELD


@frappe.whitelist()
def is_enabled():
    data = bool(
        frappe.get_system_settings("enable_telemetry")
        and frappe.conf.get("posthog_host")
        and frappe.conf.get("posthog_project_id")
    )
    return data


@frappe.whitelist()
def get_credentials():
    data = {
        "project_id": frappe.conf.get("posthog_project_id"),
        "telemetry_host": frappe.conf.get("posthog_host"),
    }
    return data


@frappe.whitelist()
def get_posthog_settings():
    data = {
        "posthog_project_id": frappe.conf.get(POSTHOG_PROJECT_FIELD),
        "posthog_host": frappe.conf.get(POSTHOG_HOST_FIELD),
        "enable_telemetry": frappe.get_system_settings("enable_telemetry"),
        "telemetry_site_age": frappe.utils.telemetry.site_age(),
    }
    return data
