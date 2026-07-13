// The `revalidator` global stores nothing — it exists purely to give RevalidatorPanel a screen in
// the admin nav. Payload still renders a "Save" button for any global's edit view, which here would
// only ever write an empty document and imply the page holds unsaved settings. Registered as the
// global's `admin.components.elements.SaveButton` override to remove it.
export default function NoSaveButton() {
  return null
}
