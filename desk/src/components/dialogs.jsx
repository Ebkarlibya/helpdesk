import { Dialog, ErrorMessage } from 'frappe-ui'
import { reactive, ref } from 'vue'

let dialogs = ref([])

export let Dialogs = {
  name: 'Dialogs',
  render() {
    console.log(dialogs.value);

    return dialogs.value.map((dialog) => (
      <div className='dialogs-wrapperrrrr' style={dialog.style}>
        <h3>{dialog}</h3>
        <Dialog
          options={dialog}
          modelValue={dialog.show}
          onUpdate:modelValue={(val) => (dialog.show = val)}
        >
          {{
            'body-content': () => {
              return [
                dialog.message && (
                  <p class="text-p-base text-ink-gray-7">{dialog.message}</p>
                ),
                dialog.html && (
                  <div v-html={dialog.html} />
                ),
                <ErrorMessage class="mt-2" message={dialog.error} />,
              ]
            },
          }}
        </Dialog>
      </div>
    ))
  },
}

export function createDialog(dialogOptions) {
  let dialog = reactive(dialogOptions)
  dialog.key = 'dialog-' + dialogs.value.length
  dialog.show = false
  setTimeout(() => {
    dialog.show = true
  }, 0)
  dialogs.value.push(dialog)
}
