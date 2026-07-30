import { NAV_ICON_OPTIONS } from '@/globals/nav/iconOptions'
import { revalidateTagSafe } from '@/utilities/revalidateTagSafe'
import type { Field, GlobalConfig } from 'payload'

// Factory helpers — Payload mutates field objects during sanitization, so every field must be a
// fresh object. These return new instances on each call rather than sharing a reference.

const iconField = (): Field => ({
  name: 'icon',
  label: 'Icon',
  type: 'select',
  options: NAV_ICON_OPTIONS,
  admin: {
    description: 'Optional icon glyph shown beside the label.',
  },
})

const linkField = (description = 'Root-relative path (e.g. /solutions) or a full URL.'): Field => ({
  name: 'link',
  label: 'Link',
  type: 'text',
  admin: { description },
})

const labelField = (required = true): Field => ({
  name: 'label',
  label: 'Label',
  type: 'text',
  localized: true,
  required,
})

/**
 * Site header — fully data-driven mega menu (WEB-464 follow-up).
 *
 * Every top-level item is either a plain link or a full-screen mega-menu "panel". Editors control
 * entirely from here which items appear, in what order, which open a panel vs. navigate directly,
 * and the full panel contents (featured card, icon columns, resource pills). Links are stored
 * locale-LESS and prefixed at render time; every `label`/text-content field is `localized`.
 */
const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  admin: {
    group: 'Site Settings',
    description: 'Site header: logo, primary navigation (with mega menus), and secondary links.',
  },
  hooks: {
    afterChange: [
      () => {
        revalidateTagSafe('header', { expire: 0 })
      },
    ],
  },
  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'siteName',
      type: 'text',
      localized: true,
    },
    {
      name: 'exploreLabel',
      label: 'Mega Menu Sidebar Heading',
      type: 'text',
      localized: true,
      defaultValue: 'Explore',
      admin: {
        description: 'Small heading shown above the item list in the open mega menu (e.g. "Explore").',
      },
    },
    {
      name: 'menu',
      label: 'Primary Navigation',
      type: 'array',
      required: false,
      admin: {
        description:
          'Top-level nav items, left to right. Each item is either a plain link or opens a full-screen mega menu.',
        initCollapsed: true,
        components: {
          RowLabel: '@/globals/nav/MenuRowLabel',
        },
      },
      fields: [
        labelField(),
        {
          name: 'type',
          label: 'Behaviour',
          type: 'select',
          required: true,
          defaultValue: 'link',
          options: [
            { label: 'Plain link (navigates)', value: 'link' },
            { label: 'Mega menu (opens full-screen panel)', value: 'mega' },
          ],
          admin: {
            description: 'Choose whether this item navigates directly, or opens its mega-menu panel below.',
          },
        },
        linkField('For a plain link: where it goes. For a mega menu: the optional "overview" destination.'),
        {
          name: 'panel',
          label: 'Mega Menu Panel',
          type: 'group',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'mega',
            description: 'Contents of the full-screen panel. Only used when Behaviour is "Mega menu".',
          },
          fields: [
            {
              name: 'eyebrow',
              label: 'Eyebrow',
              type: 'text',
              localized: true,
              admin: { description: 'Small uppercase label above the panel heading.' },
            },
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
              localized: true,
              admin: { description: 'Large headline shown at the top of the panel.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'viewAllLabel',
                  label: 'View-all Label',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', description: 'e.g. "View all".' },
                },
                {
                  name: 'viewAllLink',
                  label: 'View-all Link',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'featured',
              label: 'Featured Card',
              type: 'group',
              admin: { description: 'Optional highlighted card at the left of the panel.' },
              fields: [
                {
                  name: 'enabled',
                  label: 'Show featured card',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'badge',
                  label: 'Badge',
                  type: 'text',
                  localized: true,
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                    description: 'Small pill, e.g. "New".',
                  },
                },
                {
                  name: 'title',
                  label: 'Title',
                  type: 'text',
                  localized: true,
                  admin: { condition: (_data, siblingData) => Boolean(siblingData?.enabled) },
                },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea',
                  localized: true,
                  admin: { condition: (_data, siblingData) => Boolean(siblingData?.enabled) },
                },
                {
                  type: 'row',
                  admin: { condition: (_data, siblingData) => Boolean(siblingData?.enabled) },
                  fields: [
                    {
                      name: 'ctaLabel',
                      label: 'CTA Label',
                      type: 'text',
                      localized: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'link',
                      label: 'CTA Link',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'columns',
              label: 'Columns',
              type: 'array',
              admin: {
                description: 'Grouped link columns. Each has a small heading and a list of icon items.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'heading',
                  label: 'Column Heading',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'items',
                  label: 'Items',
                  type: 'array',
                  admin: { initCollapsed: true },
                  fields: [
                    iconField(),
                    labelField(),
                    {
                      name: 'description',
                      label: 'Description',
                      type: 'text',
                      localized: true,
                    },
                    linkField(),
                  ],
                },
              ],
            },
            {
              name: 'resources',
              label: 'Resource Links',
              type: 'array',
              admin: {
                description: 'Pill buttons shown along the bottom of the panel.',
                initCollapsed: true,
              },
              fields: [iconField(), labelField(), linkField()],
            },
          ],
        },
      ],
    },
    {
      name: 'secondaryLinks',
      label: 'Secondary Links',
      type: 'array',
      required: false,
      admin: {
        description: 'Quick links shown at the bottom of the mega-menu sidebar (About, Careers, Insights, …).',
        initCollapsed: true,
      },
      fields: [iconField(), labelField(), linkField()],
    },
  ],
}

export default Header
