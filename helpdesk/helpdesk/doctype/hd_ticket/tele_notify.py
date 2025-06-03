import requests
import frappe
import asyncio
# from telegram.helpers import escape, escape_markdown
from telegram import Bot, Message
from frappe.model.document import Document
from frappe.utils.data import now_datetime
from helpdesk.utils import build_status_emoji
from etms_hd_addons.utils import get_settings

def notify_tele_status(hd_ticket: Document):
    # site = frappe.get_doc("ETMS ERP Site", hd_ticket.ehda_etms_erp_site)

    if hd_ticket.customer:
        hd_customer = frappe.get_doc("HD Customer", hd_ticket.customer)

        if hd_customer.ehda_telegram_group_id:
            notification_title = "New Replay on Ticket" # new ticket handled with comm down
            full_name = frappe.db.get_value("User", filters={"name": frappe.session.user}, fieldname="full_name")
            datetime = now_datetime()
            msg = f"""
<b>{notification_title}:</b> {hd_ticket.name}
<b>By:</b> { full_name }
<b>Status:</b> { build_status_emoji(hd_ticket.status) }
<b>Type:</b> {hd_ticket.ticket_type}
<b>Subject:</b> {hd_ticket.subject}
<b>Site:</b> {hd_ticket.ehda_etms_erp_site}

<b>Date:</b> { datetime.strftime("%H:%M  %Y-%m-%d") }
For More Visit Support Portal:
https://{hd_ticket.portal_uri}
    """
            print(msg)
            notify_tele(hd_ticket, hd_customer.ehda_telegram_group_id, msg)


def notify_tele_replay(hd_ticket: Document, comm: Document):
    # site = frappe.get_doc("ETMS ERP Site", hd_ticket.ehda_etms_erp_site)

    if hd_ticket.customer:
        hd_customer = frappe.get_doc("HD Customer", hd_ticket.customer)

        if hd_customer.ehda_telegram_group_id:
            comm_count = frappe.db.count(
                "Communication",
                filters={
                    "reference_doctype": "HD Ticket",
                    "reference_name": hd_ticket.name,
                    "communication_type": frappe._("Communication"),
                    "status": frappe._("Linked")
                }
            )
            notification_title = "New Ticket Created" if comm_count < 2 else "New Replay on Ticket"
            full_name = frappe.db.get_value("User", filters={"name": frappe.session.user}, fieldname="full_name")
            datetime = now_datetime()


            msg = f"""
<b>{notification_title}:</b> {hd_ticket.name}
<b>By:</b> { full_name }
<b>Status:</b> { build_status_emoji(hd_ticket.status) }
<b>Type:</b> {hd_ticket.ticket_type}
<b>Subject:</b> {hd_ticket.subject}
<b>Site:</b> {hd_ticket.ehda_etms_erp_site}

<b>Date:</b> { datetime.strftime("%H:%M  %Y-%m-%d") }
For More Visit Support Portal:
https://{hd_ticket.portal_uri}
    """
            print(msg)
            notify_tele(hd_ticket, hd_customer.ehda_telegram_group_id, msg)

            # 'support.ebkartms.com'




async def send_tele_msg(hd_ticket: Document, token: str, chat_id: str, text: str):
    try:
        bot = Bot(token=token)

        if hd_ticket.ehda_telegram_recent_msg_id:
            try:
                deleted = await bot.delete_message(chat_id, hd_ticket.ehda_telegram_recent_msg_id)
            except Exception as e:
                pass
            msg: Message = await bot.send_message(chat_id=chat_id, text=text, parse_mode="HTML")
            hd_ticket.db_set("ehda_telegram_recent_msg_id", msg.id, False)
        else:
            msg: Message = await bot.send_message(chat_id=chat_id, text=text, parse_mode="HTML")
            hd_ticket.db_set("ehda_telegram_recent_msg_id", msg.id, False)

        print(msg.id)
        pass
    except Exception as e:
        print(e)
        print(frappe.get_traceback())
        frappe.log_error("ETMS HD Addons", frappe.get_traceback())

def notify_tele(hd_ticket: Document, chat_id: str, msg: str):
    # try:
        settings = get_settings()
        if settings.enable_sending_telegram_notifications:
            token = settings.get_password('tele_notify_bot_token')
            asyncio.run(send_tele_msg(hd_ticket, token, chat_id, msg))
        # url = f"https://api.telegram.org/bot{settings.get_password('tele_notify_bot_token')}/sendMessage?chat_id={chat_id}&text={msg}&parse_mode=MarkdownV2"
        print(msg)
        # print(url)
        # res = requests.get(url)
        # resJson = res.json()

        # print(resJson)
    # except Exception as e:
    #     print(e)
