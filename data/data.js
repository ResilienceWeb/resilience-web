const data = {
	nodes: [
		{
			id: 0,
			label: 'Abbey People',
			category: 'Community',
			description:
				'Abbey People in Cambridge UK is a vibrant community charity improving the lives and wellbeing of Abbey residents.',
			website: 'https://www.abbeypeople.org.uk',
			color: '#ffde59',
		},
		{
			id: 1,
			label: 'Acorn Union',
			category: 'Housing',
			description:
				'ACORN is a mass membership organisation and network of low-income people organising for a fairer deal for our communities.',
			website: 'https://www.acorntheunion.org.uk/',
			color: '#cb6ce6',
		},
		{
			id: 2,
			label: 'Adult Learn + Train',
			category: 'Education',
			description:
				'Adult Learn and Train offer leisure and vocational courses in Cambridge throughout the year. Courses run in the evening,  daytime and occasional weekends. Course length varies on the provision. ',
			website: 'https://adultlearning.education/',
			color: '#c9e265',
		},
		{
			id: 3,
			label: 'Allotment Societies',
			category: 'Food',
			description: 'Directory of allotments in Cambridge',
			website: 'https://allotments.net/',
			color: '#a4791b',
		},
		{
			id: 4,
			label: 'Animal Rebellion Cambridge',
			category: 'Animal rights',
			description:
				'Animal Rebellion is a just and sustainable mass volunteer movement that uses methods of nonviolent civil disobedience to end the animal agriculture and fishing industries, halt mass extinction and minimize the risk of climate breakdown and social collapse. ',
			website: 'https://www.facebook.com/animalrebellioncambridge/',
			color: '#ff914d',
		},
		{
			id: 5,
			label: 'Argyle Street Housing Coop',
			category: 'Housing',
			description:
				'The Argyle Street Housing Co-operative is a housing co-operative in Cambridge offering shared accommodation for individuals who wish to have greater control over their housing situation than that offered by ordinary rented accommodation. ',
			website: 'https://www.ash.coop/',
			color: '#cb6ce6',
		},
		{
			id: 6,
			label: 'Arjuna Wholefoods',
			category: 'Social business',
			description:
				'Arjuna Wholefoods is a workers’ co-operative in Cambridge fully and equally owned by those who work here. Offering delicious organic fruit and veg, a curated range of beautiful vegetarian and vegan products from tofu to chocolate, and also offer 100% vegan catering,',
			website: 'https://arjunawholefoods.co.uk/',
			color: '#778ffc',
		},
		{
			id: 7,
			label: 'Black Cantabs',
			category: 'Equity',
			description:
				"The Black Cantabs Research Society is a counter-history project created by students at the University of Cambridge in 2015. The Society has both a historical and political aim. The historical basis of the project is to uncover and preserve the legacies of Black alumni of the University of Cambridge. The political aim of the project is to critically intervene in the constructed narrative of Cambridge, and to place Black students in the institution's past, present, and future.",
			website: 'https://www.blackcantabs.org',
			color: '#ff66c4',
		},
		{
			id: 8,
			label: 'Bread on a Bike',
			category: 'Food',
			description:
				'Bread on a Bike is a micro bakery based in Cambridge, run by Alison from her domestic kitchen just off Mill Road. Fresh naturally leavened bread is baked to order and available for individual customers to collect on Thursdays and Fridays, while she bakes for commercial customers on other days. ',
			website:
				'https://cambridgesustainablefood.org/food-directory/bread-on-a-bike',
			color: '#a4791b',
		},
		{
			id: 9,
			label: 'Burwell Print',
			category: 'Social business',
			description:
				'A social enterprise, training and supporting adults with learning disabilities, providing quality design and print.',
			website: 'https://www.burwellprint.co.uk/',
			color: '#778ffc',
		},
		{
			id: 10,
			label: 'Cam Conservators',
			category: 'Nature',
			description:
				'Conservators of the River Cam are the statutory navigation authority for the River Cam from Bottisham Lock to the Mill Pond in Cambridge.',
			website: 'https://www.camconservancy.org/',
			color: '#008037',
		},
		{
			id: 11,
			label: 'Cam Valley Forum',
			category: 'Nature',
			description:
				'The Cam Valley Forum is a voluntary group, established in 2001. We work with our extensive network of partners to protect and improve the environment of the River Cam and its tributaries.',
			website: 'https://camvalleyforum.uk/',
			color: '#008037',
		},
		{
			id: 12,
			label: 'Cambridge 2030',
			category: 'Equity',
			description:
				'Cambridge 2030 is a campaign group established in 2020 to address inequalities in Cambridge, UK.',
			website: 'https://cambridge2030.org/',
			color: '#ff66c4',
		},
		{
			id: 13,
			label: 'Cambridge Area Bus Users',
			category: 'Transportation',
			description: 'Working for bus passengers in and around Cambridge',
			website: 'https://cbgbususers.wordpress.com/',
			color: '#737373',
		},
		{
			id: 14,
			label: 'Cambridge Canopy Project',
			category: 'Nature',
			description:
				'The Cambridge Canopy Project is a pilot project of the Cambridge City Council aiming to increase tree canopy cover in the city, which will help the city adapt to climate change.',
			website: 'https://www.cambridge.gov.uk/cambridge-canopy-project',
			color: '#008037',
		},
		{
			id: 15,
			label: 'Cambridge Carbon Footprint',
			category: 'Environment',
			description:
				'Raising awareness of climate change issues and supporting people in the move to low-carbon living',
			website: 'https://cambridgecarbonfootprint.org/',
			color: '#7ed957',
		},
		{
			id: 16,
			label: 'Cambridge Central Library',
			category: 'Community',
			description:
				'Cambridge central library, operated by Cambridgeshire County Council',
			website:
				'https://www.cambridgeshire.gov.uk/directory/listings/Cambridge-Central-Library',
			color: '#ffde59',
		},
		{
			id: 17,
			label: 'Cambridge Churches Homeless Project',
			category: 'Housing',
			description:
				'The Cambridge Churches Homeless Project (CCHP) is a collection of churches and a synagogue that work together to offer practical care and support to people who would otherwise be sleeping rough in our city each winter.',
			website: 'https://www.cchp.org.uk/',
			color: '#cb6ce6',
		},
		{
			id: 18,
			label: 'Cambridge City Foodbank',
			category: 'Food',
			description:
				'Cambridge city foodbank provides three days’ nutritionally balanced emergency food and support to local people who are referred to us in crisis. We are part of a nationwide network of foodbanks, supported by The Trussell Trust, working to combat poverty and hunger across the UK.',
			website: 'https://cambridgecity.foodbank.org.uk/',
			color: '#a4791b',
		},
		{
			id: 19,
			label: 'Cambridge Cleantech',
			category: 'Technology',
			description:
				'Cambridge Cleantech is a network organisation supporting the growth of sustainable, ‘clean technology’ companies in the United Kingdom. Our members range from start-ups with smart ideas in sustainable energy, water and waste, to multinational conglomerates working to reduce their environmental impact.',
			website: 'https://cambridgecleantech.org.uk/',
			color: '#a2b342',
		},
		{
			id: 20,
			label: 'Cambridge Commons',
			category: 'Equity',
			description:
				'Cambridge Commons is a collective of local volunteers motivated to raise awareness of the harmful impact of inequality, so that local people can take action to address it. ',
			website: 'https://www.thecambridgecommons.org/',
			color: '#ff66c4',
		},
		{
			id: 21,
			label: 'Cambridge Community Kitchen',
			category: 'Food',
			description:
				'Cambridge Community Kitchen provides free plant-based meals to members of the community who are facing hardship due to the pandemic.',
			website: 'https://opencollective.com/cambridge-community-kitchen/',
			color: '#a4791b',
		},
		{
			id: 22,
			label: 'Cambridge Conservation Forum',
			category: 'Nature',
			description:
				'Cambridge Conservation Forum was established in 1998 with the purpose of connecting the diverse community of conservation practitioners and researchers who are based in and around Cambridge, but may work at local, national or international levels.',
			website: 'https://www.cambridgeconservationforum.org.uk/',
			color: '#008037',
		},
		{
			id: 23,
			label: 'Cambridge Conservation Initiative',
			category: 'Nature',
			description:
				'The Cambridge Conservation Initiative aims to transform the global understanding and conservation of biodiversity by catalysing strategic partnerships between leaders in research, education, policy and practice, to secure a sustainable future for biodiversity and society.',
			website: 'https://cambridgeconservation.org',
			color: '#008037',
		},
		{
			id: 24,
			label: 'Cambridge Convoy Refugee Action Group',
			category: 'Social justice',
			description:
				'CamCRAG is a registered charity that sends regular convoys of volunteers and aid from the Cambridge region to help refugees in Europe. We collect donations, hold fundraising events, fund projects overseas and raise awareness of the refugee crisis.',
			website: 'https://camcrag.org.uk/',
			color: '#ff5757',
		},
		{
			id: 25,
			label: 'Cambridge Doughnut',
			category: 'Equity',
			description:
				'Promoting an economy that operates within the Earth’s capacity, protects the natural environment and meets the social and economic needs of all people.',
			website: 'https://cambridgedoughnut.org.uk/',
			color: '#ff66c4',
		},
		{
			id: 26,
			label: 'Cambridge Food Hub',
			category: 'Food',
			description:
				'The Cambridge Food Hub is an innovative food distribution system for the Cambridge area, aiming to increase the accessibility of sustainable food whilst supporting local producers and small businesses. ',
			website: 'https://cambridgefoodhub.org/',
			color: '#a4791b',
		},
		{
			id: 27,
			label: 'Cambridge For Black Lives',
			category: 'Social justice',
			description:
				'Black Lives Matter Cambridge is part of the movement to end structural racism both locally, nationally and internationally. ',
			website:
				'https://www.facebook.com/Cambridgeforblacklives-112964063781671/',
			color: '#ff5757',
		},
		{
			id: 28,
			label: 'Cambridge Housing Associations',
			category: 'Housing',
			description:
				'CHS are a social enterprise and charitable housing association that run a broad range of services across Cambridgeshire offering people opportunities to achieve a better quality of life.',
			website: 'https://www.chsgroup.org.uk/',
			color: '#cb6ce6',
		},
		{
			id: 29,
			label: 'Cambridge Hub Directory',
			category: 'Connectivity',
			description:
				'The Ethical Network is a community of student societies working on social and environmental issues, campaigning, fundraising, volunteering and promoting engagement with the challenges in which they are involved. ',
			website: 'https://www.cambridgehub.org/activities/ethical-network',
			color: '#5ce1e6',
		},
		{
			id: 30,
			label: 'Cambridge Local Plan',
			category: 'Transportation',
			description:
				"Cambridge City Council's local plan for development and growth of Cambridge.",
			website: 'https://cambridgelocalplan.wordpress.com/',
			color: '#737373',
		},
		{
			id: 31,
			label: 'Cambridge Organic Food Company',
			category: 'Food',
			description:
				'Fruit and veg box delivery service sourced from organic farms in the local area. We pack our veg boxes in Haslingfield just outside of Cambridge, and deliver them to homes in Cambridge and the villages and surrounding towns. ',
			website: 'https://www.cofco.co.uk/',
			color: '#a4791b',
		},
		{
			id: 32,
			label: 'Cambridge Past Present and Future',
			category: 'Nature',
			description:
				'Local charity working to protect and enhance the green setting of Cambridge, and to celebrate and improve the important built heritage of the Cambridge area.',
			website: 'https://www.cambridgeppf.org/',
			color: '#008037',
		},
		{
			id: 33,
			label: 'Cambridge Schools Eco Council',
			category: 'Environment',
			description:
				'Cambridge Schools Eco Council, are a group of young people who normally meet the first Saturday of the month to discuss the climate crisis and how we can tackle it, and to organize the YouthStrike4Climate protests.',
			website: 'https://www.cambschoolsecocouncil.uk/',
			color: '#7ed957',
		},
		{
			id: 34,
			label: 'Cambridge Street Aid',
			category: 'Community',
			description:
				'Cambridge Street Aid helps people on the streets to turn a corner. We do this by raising a fund from which people who are, or have been, on the streets can apply for a grant to help them get off, and stay off, the streets.',
			website: 'https://cambscf.org.uk/cambridge-street-aid.html',
			color: '#ffde59',
		},
		{
			id: 35,
			label: 'Cambridge Sustainable Food',
			category: 'Food',
			description:
				'Cambridge Sustainable Food is an innovative and growing partnership of public, private and community organisations in Cambridge and the surrounding villages. We work with each other to promote a vibrant local food system all along the supply chain and in our community.',
			website: 'https://cambridgesustainablefood.org/',
			color: '#a4791b',
		},
		{
			id: 36,
			label: 'Cambridge Unite the Union',
			category: 'Union',
			description:
				'Unite Cambridge Community Union is part of a national network of groups that form part of the Unite trade union. We are a campaigning organisation, which believes in solidarity and direct action.',
			website: 'https://cambridgeuniteunion.com/',
			color: '#fff780',
		},
		{
			id: 37,
			label: 'Cambridgeshire Climate Emergency',
			category: 'Environment',
			description:
				'Leading a campaign to reduce total CO2 emissions for your area by 15% by end of 2020.',
			website: 'http://camemergency.org',
			color: '#7ed957',
		},
		{
			id: 38,
			label: 'Cambridgeshire Skills',
			category: 'Education',
			description:
				'Cambridgeshire Skills is a well-respected adult and community learning service offering online and in person courses.',
			website: 'https://www.cambsals.co.uk/',
			color: '#c9e265',
		},
		{
			id: 39,
			label: 'Camcycle',
			category: 'Transportation',
			description:
				'Cambridge Cycling Campaign is a charity run by volunteers. Founded in 1995, our aim is safer, better and more cycling in the Cambridge area, where about half of the local population uses a bike at least once a month. Many of the cycle facilities such as paths, lanes, traffic signals, bridges and cycle parks would not exist without the work done by our members. ',
			website: 'https://www.camcycle.org.uk/',
			color: '#737373',
		},
		{
			id: 40,
			label: 'Camlets Local Trading',
			category: 'Connectivity',
			description:
				'CamLETS enables members to exchange skills by means of a sophisticated barter system. You get things done for yourself by doing things for other people. We welcome members from all over the Cambridgeshire area and all kinds of skills are both valued and needed. Trading events that are open to prospective members are normally held the first Sunday of each month. Occasionally there are larger trading events that are open to the public. Click on the links below for further information.',
			website: 'https://www.cam.letslink.org/',
			color: '#5ce1e6',
		},
		{
			id: 41,
			label: 'Carbon Neutral Cambridge',
			category: 'Environment',
			description:
				'Carbon Neutral Cambridge is a not-for-profit community based organisation, focussed on accelerating the transition to fair and healthy carbon neutrality within the Greater Cambridge region. ',
			website: 'https://carbonneutralcambridge.org/',
			color: '#7ed957',
		},
		{
			id: 42,
			label: 'Cherry Hinton Chalk Pit',
			category: 'Nature',
			description:
				'Former chalk quarries that now provide a variety of habitats for wildlife.  The scrub habitat in these pits provides nesting and feeding sites for more than 60 species of bird.',
			website:
				'https://www.wildlifebcn.org/nature-reserves/cherry-hinton-chalk-pits',
			color: '#008037',
		},
		{
			id: 43,
			label: 'Circular Cambridge',
			category: 'Environment',
			description:
				'Circular Cambridge celebrates progressive ways to design, manufacture, access, repair and reuse the things that we want and need in our lives.',
			website:
				'https://cambridgecarbonfootprint.org/what-we-do/circular-cambridge/',
			color: '#7ed957',
		},
		{
			id: 44,
			label: "Citizen's Advice",
			category: 'Equity',
			description:
				'We provide free, impartial, and confidential service offering advice on a wide range of issue, including benefits, debts, housing, relationships and employment.',
			website: 'https://cambridgecab.org.uk',
			color: '#ff66c4',
		},
		{
			id: 45,
			label: 'Clean Wheels',
			category: 'Transportation',
			description:
				'Our intention is to promote the development of clean car clubs in Cambridge as key element of sustainable mobility.  Clean means plug-in electric vehicles that create no tailpipe emissions on local journeys. Car clubs are able to offer their members the benefits of these advanced technologies without the costs and hassle of car ownership. ',
			website:
				'https://www.transitioncambridge.org/wiki/CleanWheels/HomePage',
			color: '#737373',
		},
		{
			id: 46,
			label: 'CoFarm Cambridge',
			category: 'Community garden',
			description:
				'Addressing multiple impact areas - climate, biodiversity, health equality, community cohesion, inclusive economies - through a new model of community-based agroecological farming we call ‘cofarming’. You can support them through volunteering or using their grocery services.',
			website: 'https://www.cofarm.co/cambridge',
			color: '#2cb868',
		},
		{
			id: 47,
			label: 'Community Apple Pressing',
			category: 'Food',
			description:
				'There are lots of apple trees in Grantchester and pressing the fruit is a village activity that happens in October each year. Everyone is welcome.',
			website:
				'http://grantchester.org.uk/activities/annual-events/apple-pressing/',
			color: '#a4791b',
		},
		{
			id: 48,
			label: 'Community Fridges',
			category: 'Food',
			description:
				'Reducing food waste and empowering communities, a community fridge is a space where local residents can share and access surplus food, including donations from local food businesses. ',
			website: 'https://www.hubbub.org.uk/the-community-fridge',
			color: '#a4791b',
		},
		{
			id: 49,
			label: 'Community Scrapstore',
			category: 'Community',
			description:
				'Our Cambridge Community Scrapstore sources interesting and unusual arts and crafts items that members can buy at a low cost. We encourage reuse and recycling – materials are often unwanted goods from local businesses and individuals.',
			website: 'https://www.cambridge.gov.uk/scrapstore',
			color: '#ffde59',
		},
		{
			id: 50,
			label: 'Community Wardrobe',
			category: 'Community',
			description:
				"Women supporting women in hard times. Free clothes, repairs, alterations food, fun, solidarity. Supported by C L P Women's Forum & Ethnic Minority Forum",
			website: 'https://www.facebook.com/communitywardrobecambridge/',
			color: '#ffde59',
		},
		{
			id: 51,
			label: 'Crop Share',
			category: 'Food',
			description:
				'Cambridge CropShare is a small-scale community-supported agriculture (CSA) scheme in Cambridge that started in 2011 and is run as a partnership between Transition Cambridge and Waterland Organics. We organise trips to the farm where anyone can join in with seasonal tasks, e.g. sowing seed, planting (on the tractor-pulled planting machine), weeding (perhaps on the lay-down weeder), harvesting (perhaps trailer loads of multicoloured squash). You then get to take away whatever freshly picked veg or fruit is available on the farm on the day, and have a bring and share meal back at the farmhouse. And of course enjoy a fun and social day filled with farming in the Fen!',
			website: 'https://cambridge.cropshare.org.uk/',
			color: '#a4791b',
		},
		{
			id: 52,
			label: 'Curiosity and Imagination',
			category: 'Art',
			description:
				'Cambridge Curiosity and Imagination is an arts and well-being charity working with artists to build creatively healthy communities. We enable people of all ages to discover their own powers of imagination and curiosity and enjoy living, learning and working alongside each other.  ',
			website: 'https://www.cambridgecandi.org.uk/',
			color: '#77fcd0',
		},
		{
			id: 53,
			label: 'Daily Bread Wholefood Warehouse',
			category: 'Food',
			description:
				'Daily Bread is a workers co-operative. Our co-operative is a business that is owned and controlled by its workers, so we are not accountable to outside share holders.  We are committed to providing good, wholesome food at a fair price, avoiding the exploitation of others, including our customers. ',
			website: 'https://www.dailybread.co.uk/',
			color: '#a4791b',
		},
		{
			id: 54,
			label: 'Darwin Nurseries',
			category: 'Social business',
			description:
				'Social business running shop and plant nursery supporting adults with learning disabilities. Our farm shop is well stocked with a wide range of produce from local producers. Explore our 7.5 acres and meet the ever expanding menagerie of goats, sheep and pigs, chickens and rabbits. Take a wander round the fledgling woodland with its lovely mini cottage nestled amongst the trees for the children to investigate then check out the greenhouse stocked with seasonal plants, hanging baskets and vegetable plants. Relax with a drink and a delicious cake in our drinks area or if it’s lovely weather why not have a picnic outside in the woodland area.',
			website: 'https://www.cpft.nhs.uk/darwinnurseries/',
			color: '#778ffc',
		},
		{
			id: 55,
			label: 'David Attenborough Building',
			category: 'Connectivity',
			description:
				'The David Attenborough Building in central Cambridge is a hub for global biodiversity conservation. The Building is home to academics and practitioners engaged in many aspects of understanding and conserving the natural world, ranging from zoological research through to work to protect the world’s pristine habitats and precious species from destruction.',
			website:
				'https://www.cambridgeconservation.org/david-attenborough-building-synergy-project/',
			color: '#5ce1e6',
		},
		{
			id: 56,
			label: 'DIY Thermal Imaging',
			category: 'Environment',
			description:
				'Come to a short training session to learn how to use our thermal cameras and interpret their images – then you can borrow a camera to survey your home, those of friends or family and (we hope) others in your neighbourhood. It’s great to see your home in a new light and it provides good motivation to fix any problems that are revealed.',
			website:
				'https://cambridgecarbonfootprint.org/what-we-do/thermal-imaging/',
			color: '#7ed957',
		},
		{
			id: 57,
			label: 'Empty Common Community Garden',
			category: 'Community garden',
			description:
				'Large community garden in the City designed and run on permaculture principles with support from Transition Cambridge, welcomes volunteers, runs weekly community gardening sessions, no experience needed.',
			website: 'https://emptycommongarden.blogspot.com/',
			color: '#2cb868',
		},
		{
			id: 58,
			label: 'Energy Group',
			category: 'Technology',
			description:
				'Regular meetings to increase understanding and raise public awareness of energy saving/generating opportunities and promote renewable energy, welcomes new members.',
			website:
				'https://www.transitioncambridge.org/wiki/TTEnergy/HomePage',
			color: '#a2b342',
		},
		{
			id: 59,
			label: 'Extinction Rebellion Cambridge',
			category: 'Environment',
			description:
				'Part of the national movement taking direct action to raise awareness of the climate and ecological breakdown and the sixth mass extinction happening now, welcomes new members.',
			website: 'https://xrcambridge.org/',
			color: '#7ed957',
		},
		{
			id: 60,
			label: 'Federation of Cambridge Residents Associations',
			category: 'Housing',
			description:
				'A grassroots civic voice, dedicated to maintaining and enhancing beautiful Cambridge as a wonderful city in which to live, work, study and relax and to grow in a way that will achieve balanced communities and quality of life.',
			website: 'https://www.fecra.org.uk',
			color: '#cb6ce6',
		},
		{
			id: 61,
			label: 'Foodcycle',
			category: 'Food',
			description:
				'Local part of national charity that builds communities through surplus food donated from suppliers and supermarkets, volunteers who collect and cook delicious meals with the food, and spare community kitchen and dining spaces where the food is served free to all in need.  Welcomes new volunteers.',
			website: 'https://www.foodcycle.org.uk/',
			color: '#a4791b',
		},
		{
			id: 62,
			label: 'Fosters Mill',
			category: 'Food',
			description:
				'The Prior’s Flour comprises a delicious range of stoneground organic flours milled, where possible, by wind power at the 160 year old Fosters Mill in Swaffham Prior. ',
			website: 'https://www.priorsflour.co.uk/',
			color: '#a4791b',
		},
		{
			id: 63,
			label: 'Free Fruit Map',
			category: 'Food',
			website:
				'https://www.transitioncambridge.org/wiki/TTFood/LocalSources',
			color: '#a4791b',
		},
		{
			id: 64,
			label: 'Friends of Cherry Hinton Brook',
			category: 'Community',
			description:
				'Friends of Cherry Hinton Brook are a group of mainly local residents who banded together in June 2009, initially triggered by the need to clear the rubbish from the Brook and its environs.  we organise regular litter picks in early Spring and late summer/autumn, and as part of the Rivercare network have equipment for this purpose.',
			website: 'https://friendsofcherryhintonbrook.org.uk/',
			color: '#ffde59',
		},
		{
			id: 65,
			label: 'Friends of Cherry Hinton Hall',
			category: 'Community',
			description:
				'The Friends act as advocates and champions of Cherry Hinton Hall grounds and provide an effective communication channel between the Council and the public.',
			website: 'http://www.cherryhintonhall.com/',
			color: '#ffde59',
		},
		{
			id: 66,
			label: 'Friends of Logans Meadow',
			category: 'Community',
			description:
				'The Friends of Logan’s Meadow is a community group based in northeast Cambridge (UK) which supports our local nature reserve. We were formed in 2019 to promote the expansion and sustainable management of the Logan’s Meadow Local Nature Reserve, an important area of green space in the City of Cambridge.  We are keen to help secure a landscape which maintains the floodplain capability, is environmentally friendly and supports an increase in  biodiversity. We also want to promote increased public participation and involvement. Membership is free and open to all.',
			website: 'https://logansmeadow.wordpress.com',
			color: '#ffde59',
		},
		{
			id: 67,
			label: 'Friends of Midsummer Common',
			category: 'Community',
			description:
				'Friends of Midsummer Common (FoMC) is a group of Cambridge people who are concerned with the good management and responsible use of this ancient grassland. FoMC established and looks after the Community Orchard on part of the Common. Volunteers help plant trees and wildflowers, cut grass and clear weeds in a sociable environment. Our mission is to make the Common a place for everyone to enjoy. FoMC welcomes new members from any part of Cambridge.',
			website: 'https://www.midsummercommon.org.uk/',
			color: '#ffde59',
		},
		{
			id: 68,
			label: 'Friends of Mill Road Cemetery',
			category: 'Community',
			description:
				'Mill Road Cemetery was created and consecrated in 1848 to provide more burial space for the city centre parishes. It is now full. It is still consecrated and owned by the parishes, and maintained as a churchyard and open space by Cambridge City Council. It is an English Heritage Grade II listed site, with several listed monuments and war graves. There are public art installations by Gordon Young, on the theme of birds and birdsong. It is always open.',
			website: 'http://millroadcemetery.org.uk/',
			color: '#ffde59',
		},
		{
			id: 69,
			label: 'Friends of Stourbridge Common',
			category: 'Community',
			description:
				'Friends of Stourbridge Common protect and enhance the biodiversity of Stourbridge Common as well as ensuring it is a safe, enjoyable place to visit for all users. Stourbridge Common in Cambridge is a part of the rich history of Cambridge. It is widely used by many people – it is a green space worth preserving and maintaining.',
			website: 'https://stourbridgecommon.wordpress.com/',
			color: '#ffde59',
		},
		{
			id: 70,
			label: 'Friends of the Earth',
			category: 'Environment',
			description:
				'Challenging environmentally damaging activities and policies by promoting sustainable alternatives.',
			website: 'http://www.cambridgefriendsoftheearth.co.uk/',
			color: '#7ed957',
		},
		{
			id: 71,
			label: 'Greenpeace',
			category: 'Environment',
			description:
				'Cambridge Greenpeace are a diverse and dedicated team of environmental activists. We are creative and passionate in protecting planet Earth. We run campaigns in and around the city of Cambridge, as well as fundraising and putting on events, such as pub quiz and film nights. ',
			website: 'https://www.cambridgegreenpeace.org/',
			color: '#7ed957',
		},
		{
			id: 72,
			label: 'Growing Spaces',
			category: 'Community garden',
			description:
				'Cambridge Growing Spaces is a Transition Cambridge project. The project aims to reclaim unloved and underused public spaces around the city of Cambridge and transform them using edible landscaping.',
			website: 'http://www.cambridge.growingspaces.org/',
			color: '#2cb868',
		},
		{
			id: 73,
			label: 'Hawthorn Farm Market Stall',
			category: 'Food',
			description:
				'Local traditional free range farm selling eggs and poultry at their regular stall on Cambridge Sunday market (mornings only). All produce grown and prepared on the farm',
			website:
				'https://cambridgesustainablefood.org/food-directory/cambridge-farmers-market',
			color: '#a4791b',
		},
		{
			id: 74,
			label: 'Healthy Start Veg Box Scheme',
			category: 'Food',
			description:
				'Run by Cambridge food hub and Cambridge Sustainable Food to make good quality organic fruit and veg more accessibe to families on low incomes who can apply if they have a Healthy Start Voucher.',
			website:
				'https://cambridgefoodhub.org/2020/09/08/healthy-start-veg-box-scheme/',
			color: '#a4791b',
		},
		{
			id: 75,
			label: 'It Takes A City',
			category: 'Housing',
			description:
				'It Takes A City – A Cambridge Homelessness Partnership. It Takes a City is a partnership providing a framework and mechanism to enable public, private and third sector bodies, and individuals, to work together in new ways to end rough sleeping due to homelessness. Our aim is not to deliver services, but to convene, clarify and coordinate, working with partners from across the community in new ways.',
			website: 'https://www.ittakesacity.org.uk/',
			color: '#cb6ce6',
		},
		{
			id: 76,
			label: 'Kings Hedges Family Support Project',
			category: 'Community',
			description:
				'At KHFSP, we aim to help parents to feel confident to make the choices that are important to them. We work in a welcoming and non-judgemental way. We help to reduce feelings of isolation and increase a sense of community and offer a high quality, safe place to play, relax and talk. At KHFSP, we work actively with partners and connect families to them, ensuring they have access to relevant information and advice.',
			website: 'https://khfsp.org.uk/',
			color: '#ffde59',
		},
		{
			id: 77,
			label: 'Living Streets',
			category: 'Transportation',
			description:
				'Living Streets is the UK charity for everyday walking.  Our mission is to achieve a better walking environment and inspire people to walk more. We want a nation where walking is the natural choice for everyday local journeys.',
			website:
				'https://www.livingstreets.org.uk/get-involved/local-groups/cambridge',
			color: '#737373',
		},
		{
			id: 78,
			label: 'Movement Against Racism',
			category: 'Social justice',
			description:
				'Peaceful Cambridge anti-racism group standing against social injustice and systemic racism, welcomes new members',
			website: 'https://www.facebook.com/MovementAgainstRaciism/',
			color: '#ff5757',
		},
		{
			id: 79,
			label: 'Movement for a Democratic Society',
			category: 'Equity',
			description:
				'Local branch of movement formed to work towards a democratic society in which people are free and equal, living in communities based on common ownership that guarantee housing, food and a place to belong',
			website:
				'https://www.facebook.com/Movement-for-a-Democratic-Society-Cambridge-356298144962954/',
			color: '#ff66c4',
		},
		{
			id: 80,
			label: 'Mutual Aid',
			category: 'Community',
			description:
				'Informal local support networks set up during C19 pandemic by residents in their districts  - each area has own group and runs autonomously. Listings and contact details on Cambridgeshire County Council website',
			website: 'https://www.mutual-aid.co.uk/area/cambridgeshire',
			color: '#ffde59',
		},
		{
			id: 81,
			label: 'Natural Cambridgeshire',
			category: 'Nature',
			description:
				'Natural Cambridgeshire runs a variety of projects to create a quality natural environment where people and wildlife can flourish.',
			website: 'https://naturalcambridgeshire.org.uk/',
			color: '#008037',
		},
		{
			id: 82,
			label: 'Net Zero Now',
			category: 'Environment',
			description:
				'Project supporting individuals and community groups to deliver carbon reduction activities in South Cambridgeshire, run by Cambridge Carbon Footprint with support from South Cambs. District Council',
			website:
				'https://cambridgecarbonfootprint.org/what-we-do/net-zero/',
			color: '#7ed957',
		},
		{
			id: 83,
			label: 'Nightingale Community Garden',
			category: 'Community garden',
			description:
				'Community garden on the site of an old bowls club,with pond, benches, flowers, veg and trees, welcomes volunteers and visitors to just sit and relax. Small car park for visitors, 3hr max stay.',
			website: 'http://www.nightingalegarden.org.uk/',
			color: '#2cb868',
		},
		{
			id: 84,
			label: 'On the Verge',
			category: 'Nature',
			description:
				"Promotes the growing of nectar rich flowers throughout the city for the benefit of insects which are in catastrophic decline. Aiming to make Cambridge welcoming to pollinators by providing them with 'food corridors' so they dont have to fly long distances, plus increasing bodiversity in Cambridge.",
			website: 'https://www.onthevergecambridge.org.uk/',
			color: '#008037',
		},
		{
			id: 85,
			label: 'Open Eco Homes',
			category: 'Housing',
			description:
				'Promotes awareness of how to create beautiful, high functioning, low energy homes by finding local householders who have renovated or built new ecohomes and helping them pass on their knowledge to visitors, organising free tours in their homes each September',
			website: 'http://openecohomes.org/',
			color: '#cb6ce6',
		},
		{
			id: 86,
			label: 'Permaculture Guild',
			category: 'Community',
			description:
				'Group of local people interested in and/ or qualified in permaculture design or design (of nearly anything, not necessarily land based) in accordance with ethics and natural principles. Contact through Transition Cambridge website, welcomes new members.',
			website:
				'https://www.transitioncambridge.org/wiki/TTPermaculture/HomePage',
			color: '#ffde59',
		},
		{
			id: 87,
			label: 'Prospects Trust (Snakehall Farm)',
			category: 'Social business',
			description:
				'Working organic care farm near Ely with an onsite farm shop, providing placements and offering therapeutic horticulture and farm based work experience to people with learning difficulties, disabilities and those with varying health needs.',
			website: 'https://prospectstrust.org.uk/',
			color: '#778ffc',
		},
		{
			id: 88,
			label: 'Radmore Farm Shop',
			category: 'Food',
			description:
				'Local outlet for family farm in Northants. selling meats and free range eggs from the farm plus a large range of produce from other local farms and suppliers, including Fairtrade.',
			website: 'https://radmorefarmshop.co.uk/',
			color: '#a4791b',
		},
		{
			id: 89,
			label: 'Reach Solar Farm CBS',
			category: 'Social business',
			description:
				"Community solar farm near the village of Reach, providing up to half of the village's electricity. Owned and run by a co-operative of local people as a Community Benefit Society with the object of benefitting the community as well as giving a dividend to investors",
			website: 'http://www.reachsolarfarm.co.uk/',
			color: '#778ffc',
		},
		{
			id: 90,
			label: 'Red Hen Project',
			category: 'Education',
			description:
				'Small charity run by Soroptimists International in Cambridge, working with 5 primary schools in North Cambridge, to support children and their families in overcoming barriers to learning and provide a link between home and school.',
			website: 'https://redhenproject.org',
			color: '#c9e265',
		},
		{
			id: 91,
			label: 'Repair Cafes',
			category: 'Technology',
			description:
				'Get things fixed for free at a repair cafe jointly run by Cambridge Carbon Footprint and Transition Cambridge in a local church hall. There will be a cafe to have a drink while you wait for your repair on mobile phone, bicycle,clothes tec..',
			website: 'http://circularcambridge.org/repair-cafes/',
			color: '#a2b342',
		},
		{
			id: 92,
			label: 'Romsey Town Community Garden',
			category: 'Community garden',
			description:
				"Beautiful sustainable garden off Mill Road, aiming to bring the local community together in a space for leisure and relaxation. Grass area, flower and vegetable beds, herb garden, children's garden, wildflower area. Welcomes volunteers.",
			website:
				'https://www.transitioncambridge.org/wiki/TTFood/RomseyCommunityGarden',
			color: '#2cb868',
		},
		{
			id: 93,
			label: 'Rowan Art Centre',
			category: 'Art',
			description:
				'Arts Centre for people with learning disabilities, providing a safe, creative and welcoming place to use the arts as a tool to bring people together, break down social exclusion and improve health and wellbeing. Evening classes for all.',
			website: 'http://www.rowanhumberstone.co.uk/',
			color: '#77fcd0',
		},
		{
			id: 94,
			label: 'School strikes',
			category: 'Environment',
			description:
				'Youth of Cambridge demanding action on climate change - not an abstract problem, this is a real Climate Emergency!',
			website:
				'https://en-gb.facebook.com/pg/YouthStrike4ClimateCambridge/posts/',
			color: '#7ed957',
		},
		{
			id: 95,
			label: 'Simons Vegetable Stall',
			category: 'Food',
			description:
				"Local grower from the Fens, selling organic produce on Cambridge Sunday market come rain or shine, always there. Self service stall opposite Great St. Mary's church",
			website:
				'https://www.facebook.com/pages/category/Community/Simons-Local-Vegetable-Stall-on-the-Sunday-Farmers-Market-in-Cambridge-536598633028253/',
			color: '#a4791b',
		},
		{
			id: 96,
			label: 'Smarter Cambridge Transport',
			category: 'Transportation',
			description:
				'Think tank initiative of impartial local volunteers, developing and promoting a modern vision for integrated transport in Cambridge and the surrounding region. with a focus on ensuring that the Greater Cambridge City deal money is spent in the best possible way.',
			website: 'https://www.smartertransport.uk',
			color: '#737373',
		},
		{
			id: 97,
			label: 'Solar Together',
			category: 'Environment',
			description:
				'A group buying scheme to help Cambs. residents buy high quality and competitively priced solar panels with battery storage systems, run by loacal authorities with a group buying specialist in the field.',
			website: 'https://www.solartogether.co.uk/cambridgeshire/home',
			color: '#7ed957',
		},
		{
			id: 98,
			label: 'Stand up to Racism',
			category: 'Social justice',
			description:
				'Campaigning to combat racism and bigotry of all kinds while working towards a community united by mutual respect',
			website: 'https://www.facebook.com/CambridgeSUTR/',
			color: '#ff5757',
		},
		{
			id: 99,
			label: 'Transition Cambridge',
			category: 'Community',
			description:
				'Transition Cambridge is working towards building a stronger, more versatile community with the capacity to adapt to climate change and energy price hikes, while supporting local people to be happy and healthy. It welcomes volunteers to work in a variety of ways towards creating a society that makes better use of local resources.',
			website: 'https://www.transitioncambridge.org/',
			color: '#ffde59',
		},
		{
			id: 100,
			label: 'Trumpington Meadows Reserve',
			category: 'Nature',
			description:
				'Expansive nature reserve created for wildlife and people and run by Wildlife Trust. A place to discover and enjoy nature, explore diverse habitats, wander by the river and through flower filled meadows all managed for wildlife. Wildlife Trust office and garden.',
			website:
				'https://www.wildlifebcn.org/nature-reserves/trumpington-meadows',
			color: '#008037',
		},
		{
			id: 101,
			label: 'U3AC',
			category: 'Education',
			description:
				'Independent organisation organising educational, social and fitness activities for Cambridge people who are not, or no longer in full time employment. There are no age restrictions, welcomes new members.',
			website: 'https://www.u3ac.org.uk/',
			color: '#c9e265',
		},
		{
			id: 102,
			label: 'University and College Union',
			category: 'Union',
			website: 'http://www.ucu.cam.ac.uk/',
			color: '#fff780',
		},
		{
			id: 103,
			label: 'Wandlebury Country Park',
			category: 'Nature',
			description:
				'Large country park on remains of a circular Iron Age hillfort on  the Gog Magog Hills just South of Cambridge, with wildflower meadows, woodland and viewpoints, plenty of space to walk and play. Has one of the most diverse range of tree species in the area, plus many interesting species of all kinds of wild flowers, insects, birds, pond life. Car park (charged). Magog Down is opposite.',
			website:
				'https://www.cambridgeppf.org/pages/category/wandlebury-country-park',
			color: '#008037',
		},
		{
			id: 104,
			label: 'Waterland Organics',
			category: 'Food',
			description:
				'Small family run farm running community supported agriculture scheme (CSA) in Lode, growing organic vegetables and fruit, delivering local grown veg boxes throughout Cambridge. Welcomes volunteers via Cambridge Cropshare.  ',
			website: 'https://www.waterlandorganics.com/',
			color: '#a4791b',
		},
		{
			id: 105,
			label: 'Local Wildlife Trust',
			category: 'Nature',
			description:
				'Manage local nature reserves, runs courses,advises on wildlife, mission to create a wilder future by protecting and restoring wildlife and wild places across the county. Welcomes volunteers.',
			website: 'https://www.wildlifetrusts.org/',
			color: '#008037',
		},
		{
			id: 106,
			label: 'Wildlife Wanders',
			category: 'Nature',
			description:
				"Occasional friendly and sociable walks to explore Cambridge's green spaces and take a closer look at nature along the way. Looking for volunteers to organise more wanderings soon.",
			website:
				'https://www.transitioncambridge.org/wiki/TTNature/HomePage',
			color: '#008037',
		},
		{
			id: 107,
			label: 'Womens Resources Centre',
			category: 'Equity',
			description:
				"Women's community space which offers a safe welcoming environment plus a realm of services to make life and living a little bit easier. Practical support and advice on issues uncluding debt, family and parenting, together with a mix of fun and practicial informal groups, workshops and networking events. Coffee room and free wifi.",
			website: 'https://www.cwrc.org.uk/',
			color: '#ff66c4',
		},
		{
			id: 108,
			label: 'Woodland Trust',
			category: 'Nature',
			description:
				'Cares for woods open to the public at Foxton and Bassingbourn ',
			website: 'https://www.woodlandtrust.org.uk/',
			color: '#008037',
		},
		{
			id: 109,
			label: 'XR Cambridge Unis',
			category: 'Environment',
			website: 'https://www.facebook.com/XRCamUnis/',
			color: '#7ed957',
		},
		{
			id: 110,
			label: 'Extinction Rebellion Youth',
			category: 'Environment',
			description:
				'Local Extinction Rebellion group run by and for young people',
			website: 'https://xrcambridge.org/youth',
			color: '#7ed957',
		},
		{
			id: 111,
			label: 'Cambridge Zero',
			category: 'Environment',
			website: 'https://www.zero.cam.ac.uk/',
			color: '#7ed957',
		},
		{
			id: 112,
			label: 'Anonymous for the Voiceless',
			category: 'Animal rights',
			description:
				'Anonymous for the Voiceless (AV) is an animal rights organisation that specialises in edifying the public on animal abuse and fostering highly effective activism groups worldwide. We hold an abolitionist stance against all forms of animal exploitation and promote a clear animal rights message.',
			website: 'https://www.anonymousforthevoiceless.org/',
			color: '#ff914d',
		},
		{
			id: 113,
			label: 'Animal Rights Cambridge',
			category: 'Animal rights',
			description:
				'All volunteer, intergenerational group of people committed to strategies to end the exploitation of non- human animals. Focus on crucial isseues and confronting companies and institutions to raise public awareness and bring forth meaningful change for animals.',
			website: 'https://animalrightscambridge.wordpress.com/',
			color: '#ff914d',
		},
		{
			id: 114,
			label: 'Cambridge Hunt Saboteurs',
			category: 'Animal rights',
			description:
				'Protecting wildlife from hunting and persecution in East Anglia. Welcomes volunteers.',
			website: 'https://www.huntsabs.org.uk/',
			color: '#ff914d',
		},
		{
			id: 115,
			label: 'South Cambs Hunt Saboteurs',
			category: 'Animal rights',
			description:
				'Use non violent direct action to save the lives of hunted animals.',
			website: 'https://www.huntsabs.org.uk/',
			color: '#ff914d',
		},
		{
			id: 116,
			label: 'The Lockon',
			category: 'Community',
			description:
				'The Lockon is a reclaimed space for the community. They host Cambridge Community Kitchen and 2 community fridges, supporting many people in need.',
			website: 'https://www.facebook.com/thelockon',
			color: '#ffde59',
		},
		{
			id: 117,
			label: 'Cambridge & District Trades Council',
			category: 'Union',
			description:
				'Trades union councils are local groups of trade unionists. CambsTUC is the Trades Council for Cambridge and its surrounding areas.',
			website: 'https://cambstuc.org/',
			color: '#fff780',
		},
		{
			id: 118,
			label: "Cambridge People's Assembly",
			category: 'Social justice',
			description:
				'Broad united national campaign against austerity, cuts and privatisation in our workplaces, community and welfare services',
			website: 'https://thepeoplesassembly.org.uk',
			color: '#ff5757',
		},
		{
			id: 119,
			label: 'Unison Cambridgeshire County',
			category: 'Union',
			description:
				'Largest single trade union branch in Cambridgeshire, and part of the largest public services trade union, UNISON; with members working across hundreds of organisations and employers.',
			website: 'https://unisoncambridgeshire.org.uk/',
			color: '#fff780',
		},
		{
			id: 120,
			label: 'Global Sustainability Institute',
			category: 'Environment',
			description:
				"We're committed to playing a key role in developing practical solutions to the sustainability challenges we all face, both locally and globally. We do this through research and education - bringing together the information needed to make decisions, with the people capable of taking action.",
			website: 'https://aru.ac.uk/global-sustainability-institute-gsi',
			color: '#7ed957',
		},
		{
			id: 121,
			label: 'Maxwell Centre',
			category: 'Connectivity',
			website: 'https://www.maxwell.cam.ac.uk/',
			color: '#5ce1e6',
		},
		{
			id: 122,
			label: 'Camnexus',
			category: 'Technology',
			website: 'https://www.camnexus.io/',
			color: '#a2b342',
		},
		{
			id: 123,
			label: 'Cambridge Electric Transport',
			category: 'Transportation',
			website: 'https://cambridgeelectrictransport.co.uk/',
			color: '#737373',
		},
		{
			id: 124,
			label: 'Zedify',
			category: 'Transportation',
			website: 'https://www.zedify.co.uk/cambridge',
			color: '#737373',
		},
		{
			id: 125,
			label: 'Green Pages',
			category: 'Connectivity',
			description:
				'Set up by a group of volunteers based in Cambridge, this website is a guide to living sustainably in and around Cambridge. Check out our directory for local businesses and online retailers who have everything you need to live more sustainably.',
			website: 'https://greenpages.org.uk/',
			color: '#5ce1e6',
		},
		{
			id: 126,
			label: 'Cambridge Hedgehogs',
			category: 'Nature',
			description: '',
			website: '',
			color: '#008037',
		},
		{
			id: 999,
			label: 'Cambridge Resilience Web',
			color: '#fcba03',
			isDescriptive: true,
			font: { size: 46 },
		},
		{ id: 1000, label: 'Community', color: '#c3c4c7', isDescriptive: true },
		{ id: 2000, label: 'Housing', color: '#c3c4c7', isDescriptive: true },
		{ id: 3000, label: 'Education', color: '#c3c4c7', isDescriptive: true },
		{ id: 4000, label: 'Food', color: '#c3c4c7', isDescriptive: true },
		{
			id: 5000,
			label: 'Animal rights',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{
			id: 6000,
			label: 'Social business',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{ id: 7000, label: 'Equity', color: '#c3c4c7', isDescriptive: true },
		{
			id: 8000,
			label: 'Nature/Conservation',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{
			id: 9000,
			label: 'Transportation',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{
			id: 10000,
			label: 'Environment',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{
			id: 11000,
			label: 'Technology',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{
			id: 12000,
			label: 'Social justice',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{
			id: 13000,
			label: 'Connectivity',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{ id: 14000, label: 'Union', color: '#c3c4c7', isDescriptive: true },
		{
			id: 15000,
			label: 'Community garden',
			color: '#c3c4c7',
			isDescriptive: true,
		},
		{ id: 16000, label: 'Art', color: '#c3c4c7', isDescriptive: true },
	],
	edges: [
		{ from: 999, to: 1000, length: 2000 },
		{ from: 1000, to: 0 },
		{ from: 1000, to: 16 },
		{ from: 1000, to: 34 },
		{ from: 1000, to: 49 },
		{ from: 1000, to: 50 },
		{ from: 1000, to: 64 },
		{ from: 1000, to: 65 },
		{ from: 1000, to: 66 },
		{ from: 1000, to: 67 },
		{ from: 1000, to: 68 },
		{ from: 1000, to: 69 },
		{ from: 1000, to: 76 },
		{ from: 1000, to: 80 },
		{ from: 1000, to: 86 },
		{ from: 1000, to: 99 },
		{ from: 1000, to: 116 },
		{ from: 999, to: 2000, length: 2000 },
		{ from: 2000, to: 1 },
		{ from: 2000, to: 5 },
		{ from: 2000, to: 17 },
		{ from: 2000, to: 28 },
		{ from: 2000, to: 60 },
		{ from: 2000, to: 75 },
		{ from: 2000, to: 85 },
		{ from: 999, to: 3000, length: 2000 },
		{ from: 3000, to: 2 },
		{ from: 3000, to: 38 },
		{ from: 3000, to: 90 },
		{ from: 3000, to: 101 },
		{ from: 999, to: 4000, length: 2000 },
		{ from: 4000, to: 3 },
		{ from: 4000, to: 8 },
		{ from: 4000, to: 18 },
		{ from: 4000, to: 21 },
		{ from: 4000, to: 26 },
		{ from: 4000, to: 31 },
		{ from: 4000, to: 35 },
		{ from: 4000, to: 47 },
		{ from: 4000, to: 48 },
		{ from: 4000, to: 51 },
		{ from: 4000, to: 53 },
		{ from: 4000, to: 61 },
		{ from: 4000, to: 62 },
		{ from: 4000, to: 63 },
		{ from: 4000, to: 73 },
		{ from: 4000, to: 74 },
		{ from: 4000, to: 88 },
		{ from: 4000, to: 95 },
		{ from: 4000, to: 104 },
		{ from: 999, to: 5000, length: 2000 },
		{ from: 5000, to: 4 },
		{ from: 5000, to: 112 },
		{ from: 5000, to: 113 },
		{ from: 5000, to: 114 },
		{ from: 5000, to: 115 },
		{ from: 999, to: 6000, length: 2000 },
		{ from: 6000, to: 6 },
		{ from: 6000, to: 9 },
		{ from: 6000, to: 54 },
		{ from: 6000, to: 87 },
		{ from: 6000, to: 89 },
		{ from: 999, to: 7000, length: 2000 },
		{ from: 7000, to: 7 },
		{ from: 7000, to: 12 },
		{ from: 7000, to: 20 },
		{ from: 7000, to: 25 },
		{ from: 7000, to: 44 },
		{ from: 7000, to: 79 },
		{ from: 7000, to: 107 },
		{ from: 999, to: 8000, length: 2000 },
		{ from: 8000, to: 10 },
		{ from: 8000, to: 11 },
		{ from: 8000, to: 14 },
		{ from: 8000, to: 22 },
		{ from: 8000, to: 23 },
		{ from: 8000, to: 32 },
		{ from: 8000, to: 42 },
		{ from: 8000, to: 81 },
		{ from: 8000, to: 84 },
		{ from: 8000, to: 100 },
		{ from: 8000, to: 103 },
		{ from: 8000, to: 105 },
		{ from: 8000, to: 106 },
		{ from: 8000, to: 108 },
		{ from: 8000, to: 126 },
		{ from: 999, to: 9000, length: 2000 },
		{ from: 9000, to: 13 },
		{ from: 9000, to: 30 },
		{ from: 9000, to: 39 },
		{ from: 9000, to: 45 },
		{ from: 9000, to: 77 },
		{ from: 9000, to: 96 },
		{ from: 9000, to: 123 },
		{ from: 9000, to: 124 },
		{ from: 999, to: 10000, length: 2000 },
		{ from: 10000, to: 15 },
		{ from: 10000, to: 33 },
		{ from: 10000, to: 37 },
		{ from: 10000, to: 41 },
		{ from: 10000, to: 43 },
		{ from: 10000, to: 56 },
		{ from: 10000, to: 59 },
		{ from: 10000, to: 70 },
		{ from: 10000, to: 71 },
		{ from: 10000, to: 82 },
		{ from: 10000, to: 94 },
		{ from: 10000, to: 97 },
		{ from: 10000, to: 109 },
		{ from: 10000, to: 110 },
		{ from: 10000, to: 111 },
		{ from: 10000, to: 120 },
		{ from: 999, to: 11000, length: 2000 },
		{ from: 11000, to: 19 },
		{ from: 11000, to: 58 },
		{ from: 11000, to: 91 },
		{ from: 11000, to: 122 },
		{ from: 999, to: 12000, length: 2000 },
		{ from: 12000, to: 24 },
		{ from: 12000, to: 27 },
		{ from: 12000, to: 78 },
		{ from: 12000, to: 98 },
		{ from: 12000, to: 118 },
		{ from: 999, to: 13000, length: 2000 },
		{ from: 13000, to: 29 },
		{ from: 13000, to: 40 },
		{ from: 13000, to: 55 },
		{ from: 13000, to: 121 },
		{ from: 13000, to: 125 },
		{ from: 999, to: 14000, length: 2000 },
		{ from: 14000, to: 36 },
		{ from: 14000, to: 102 },
		{ from: 14000, to: 117 },
		{ from: 14000, to: 119 },
		{ from: 999, to: 15000, length: 2000 },
		{ from: 15000, to: 46 },
		{ from: 15000, to: 57 },
		{ from: 15000, to: 72 },
		{ from: 15000, to: 83 },
		{ from: 15000, to: 92 },
		{ from: 999, to: 16000, length: 2000 },
		{ from: 16000, to: 52 },
		{ from: 16000, to: 93 },
	],
};
export default data;
