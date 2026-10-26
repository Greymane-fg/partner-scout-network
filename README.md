# Partner Scout Network

I want to build a website that is split into multiple veiws. Each view can be categorized into three categories: Ecom,  White Collar Executive, Agent.
those are also the three types of users. All three see a different ui/ux layout. The purpose of the site is to veiw and contact the agents.
The ecom views are for the ecom users/clients. They see a verrsion of the site with a layout that appeals to ecom merchants.  Same for White collar execs. They can either scroll the homepage of their view, use the searchbar to search by skill/service or by name/partner id if they aleady know who theyre looking for.  It lists the ecom relevant skills, projects, and reviews for that agent. It also ggives multiple ways to contact the agent. Each of the available way must prefill some basic info: Name, service needed, and view(added automatically). 

The links must also be separate from each other, for examle: agent.exampleesite.com for the agents, ecom.examplesite.com for the ecom merchants etc, with no internal linking between views. The  agents would have one overall admin who can add and remove agents, and promote them as well. If an agent is made an admin, they can also remove other agents.  The other agents can only add an agent but cant remove them. There can only be 10 admins at any given time. The addmins can change their own personal informasion(name, profile, projects, skills, etc), choose which skills and projects are for ecom and which are for white collar execs, choose which contact method is pimary for ecom and which is primary for execs. There can be as many contact methods as there are pplatforms, including all social media platforms, major freelancing platforms etc. 

The skills uploaded by one agent are available for all agents to use, but not projects. Projects can be removed by admins. all sites share the same database.


The ui/ux styles of all views should be highly modern. All views exept the agents should have a full page hero, with uncluttered design that has professional spacing rules, professional color styles(different for ecom and exec, bright grey and orrange for agents), different typography(search online for fitting typography). They should also include all mandatory policy pages, and about us page, all seo pages, and a blogs page where each agent  can post a blog.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://partner-scout-network.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c3401609-de5e-4604-8905-0b3edc8e8a3e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
