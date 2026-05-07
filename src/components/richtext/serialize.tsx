import escapeHTML from 'escape-html'
import Image from 'next/image'
import { Fragment } from 'react'
import { Text } from 'slate'

export interface RichText {
  root: {
    type: string
    children: {
      type: 'paragraph' | 'heading' | 'list-item' | string
      children: {
        type: 'text' | string
        text: string
        detail?: number
        format?: number
        mode?: string
        style?: string
        version?: number
      }[]
      direction?: 'ltr' | 'rtl'
      format?: string
      indent?: number
      version?: number
      tag?: string
      textFormat?: number
      textStyle?: string
    }[]
    direction?: 'ltr' | 'rtl' | null
    format?: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent?: number
    version?: number
  }
  [k: string]: unknown
}

// Helper to extract plain text from children
// @ts-expect-error: getTextFromChildren has return type 'any'
const getTextFromChildren = (children) => {
  if (!children) return ''
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('')
  }
  if (typeof children.text === 'string') return children.text
  if (children.children) return getTextFromChildren(children.children)
  return ''
}

// Helper to slugify text for id
// @ts-expect-error: str is of type 'any'
export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .replace(/-{2,}/g, '-') // Collapse multiple hyphens

// @ts-expect-error: children is not defined
export default function serialize(children) {
  if (!children) return null

  return (
    (Array.isArray(children) &&
      children?.map((node, i) => {
        if (Text.isText(node)) {
          let text = <span dangerouslySetInnerHTML={{ __html: escapeHTML(node.text) }} />

          // @ts-expect-error: bold is not defined
          if (node.bold) {
            text = <strong key={i}>{text}</strong>
          }

          // @ts-expect-error: code is not defined
          if (node.code) {
            text = <code key={i}>{text}</code>
          }

          // @ts-expect-error: italic is not defined
          if (node.italic) {
            text = <em key={i}>{text}</em>
          }

          // @ts-expect-error: underline is not defined
          if (node.underline) {
            text = (
              <span style={{ textDecoration: 'underline' }} key={i}>
                {text}
              </span>
            )
          }

          // @ts-expect-error: strikethrough is not defined
          if (node.strikethrough) {
            text = (
              <span style={{ textDecoration: 'line-through' }} key={i}>
                {text}
              </span>
            )
          }

          return <Fragment key={i}>{text}</Fragment>
        }

        if (!node) {
          return null
        }

        switch (node.type) {
          case 'heading': {
            const text = getTextFromChildren(node.children)
            const id = slugify(text)
            const Tag = node.tag
            const classNames = {
              h1: 'lg:text-4xl text-3xl mb-8 font-semibold',
              h2: 'lg:text-3xl text-2xl mb-8 font-semibold',
              h3: 'lg:text-2xl text-xl mb-8 font-semibold',
              h4: 'text-xl  mb-8 font-semibold',
              h5: 'lg:text-lg text-base ',
              h6: 'lg:text-base text-sm',
              p: 'lg:text-base text-sm text-[#D5D5D5]',
            }
            return (
              // @ts-expect-error: classNames[Tag] is of type 'any'
              <Tag className={classNames[Tag]} id={id} key={i}>
                {serialize(node?.children)}
              </Tag>
            )
          }
          case 'quote':
            return <blockquote key={i}>{serialize(node?.children)}</blockquote>
          case 'list':
            return (
              <ul className="mt-4 list-disc list-inside space-y-2" key={i}>
                {serialize(node?.children)}
              </ul>
            )
          case 'ol':
            return <ol key={i}>{serialize(node.children)}</ol>
          case 'listitem':
            return (
              <li className="text-[#F4F3EC]" key={i}>
                {serialize(node.children)}
              </li>
            )
          case 'link': {
            const url = node.fields?.url || '#'
            const newTab = node.fields?.newTab
            return (
              <a
                key={i}
                href={url}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                className="text-yellowPrimary underline hover:text-greenPrimary transition-colors"
              >
                {serialize(node.children)}
              </a>
            )
          }
          case 'upload': {
            const { value } = node
            if (!value || !value.url) return null
            return (
              <Image
                key={i}
                src={value.url}
                alt={value.alt || ''}
                width={value.width || undefined}
                height={value.height || undefined}
                style={{ maxWidth: '100%', height: 'auto', margin: '24px 0' }}
              />
            )
          }
          case 'paragraph':
            return (
              <p className="mt-4 text-[#F4F3EC] leading-relaxed" key={i}>
                {serialize(node?.children)}
              </p>
            )
          default:
            return <div key={i}>{serialize(node?.children)}</div>
        }
      })) ||
    []
  )
}
