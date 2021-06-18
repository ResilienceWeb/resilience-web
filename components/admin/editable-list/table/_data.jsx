import { Badge } from '@chakra-ui/react';
import * as React from 'react';
import { User } from './User';

export const data = [
	{
		role: 'Admin',
		status: 'active',
		earned: '$45,000',
		id: 'blog',
		user: {
			image: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NDN8fGd1eSUyMGZhY2V8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
			name: 'Marion Watson',
			email: 'codyfisher@example.com',
		},
	},
	{
		role: 'Marketing Director',
		status: 'reviewing',
		earned: '$4,840',
		id: 'home',
		user: {
			image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
			name: 'Louise Hopkins',
			email: 'jane@example.com',
		},
	},
	{
		role: 'Front Desk Officer',
		status: 'declined',
		id: 'design-system',
		earned: '$89,054',
		user: {
			image: 'https://images.unsplash.com/photo-1470506028280-a011fb34b6f7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NjN8fGxhZHklMjBmYWNlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
			name: 'Susan Schwartz',
			email: 'jenyzx@exmaple.com',
		},
	},
	{
		role: 'Lead Software Engineer',
		status: 'active',
		earned: '$19,954',
		id: 'home-2',
		user: {
			image: 'https://images.unsplash.com/photo-1533674689012-136b487b7736?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mjl8fGFmcmljYSUyMGxhZHklMjBmYWNlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
			name: 'Sade Akinlade',
			email: 'melyb@example.com',
		},
	},
];
const badgeEnum = {
	active: 'green',
	reviewing: 'orange',
	declined: 'red',
};
