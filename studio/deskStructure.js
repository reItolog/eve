import S from '@sanity/desk-tool/structure-builder'

const hiddenDocTypes = listItem =>
  !['home'].includes(listItem.getId())

export default () =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
      .title('Home')
      .child(
        S.editor()
        .title('Home')
        .id('home')
        .schemaType('home')
        .documentId('home'),
      ),
      ...S.documentTypeListItems().filter(hiddenDocTypes)
    ])