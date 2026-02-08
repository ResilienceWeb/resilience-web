import { driver } from 'driver.js'

export const tour = driver({
  showProgress: true,
  allowClose: true,
  steps: [
    {
      element: '[data-tourid=new-listing]',
      popover: {
        title: 'Create your first listing 🙌',
        description:
          'Try to create your first listing here. Feel free to experiment, anything can be edited or deleted.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tourid=nav-categories]',
      popover: {
        title: 'Edit categories & tags 🏷️',
        description:
          'All the categories and tags are customisable and you can edit them here.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tourid=nav-team]',
      popover: {
        title: 'Manage your team',
        description: 'Invite collaborators and manage your team here.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tourid=nav-websettings]',
      popover: {
        title: 'Edit web settings ⚙️',
        description:
          'If you are an owner, you can also edit web settings on the left hand side. As an editor, you can only edit listings and categories.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tourid=nav-import]',
      popover: {
        title: 'Import listings from a CSV file 📒',
        description:
          'Import listings from a CSV file with column mapping and validation.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'We will let you crack on now 😊',
        description:
          "If you need any support along the way, don't hesitate to get in touch via the Get in touch button at the top",
      },
    },
  ],
})
