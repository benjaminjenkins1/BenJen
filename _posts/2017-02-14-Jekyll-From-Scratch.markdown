---
layout: post
lead: If youre like me and would rather not represent yourself with someone else's work, you might not like the idea of using a prebuilt theme for your blog or personal webpage. This means that if you ever do want to set up a blog, you get to experience the joys of learning the inner workings of the platform. I had used WordPress in the past and enjoyed the polished feel, but I didn't need nearly everything it offered so I turned to Jekyll, a simple but powerful CMS that excels at hosting static sites. In this post I go through what it takes to turn a bank-slate Jekyll site into your own unique creation.  
---

## Getting Started

First, you obviously need to get everything installed. Rather than type out a lengthy instalation guide here, I'll point you to [Scotch.io's excellent installation guide](https://scotch.io/tutorials/getting-started-with-jekyll-plus-a-free-bootstrap-3-starter-theme). Stop when you get to the "Getting Started" section, because `jekyll new my-blog` will add the default theme to your site, and that's not what we want.

Instead, to set up a blank slate site, type `jekyll new your-blog-name --blank`. This will create a new folder in the current directory with the most barebones site possible. It's so barebones it doesn't even have a config file, so that's what we'll do first.

Note: Now would also be a good time to set this directory up as a git repository.

Make a new file in the root directory of your new site called `_config.yml`. Windows: `tpye nul > _config.yml` Bash: `touch _config.yml`. Right now we'll just add a few basic necesseties, like where Jekyll should look for layouts, and pages other than your blog posts, like "about me" or "portfolio' pages. 

Add this to your _config.yml:
  ```
  # Where things are
  source:      .
  destination: ./_site
  plugins_dir: ./_plugins
  layouts_dir: ./_layouts
  data_dir:    ./_data
  
  include ['_pages']
  ```

Now go add some stuff the index.html file in your site's root directory so that something shows up once we build the site.

Build the side by running `jekyll b` at your site's root. It will make a folder called _site . This contains the ready-to-serve files. You can start a super-useful dev-server that rebuilds the page whenever you make changes by running `jekyll s`.

if you navigate to the address of the Jekyll dev-server, you'll see the contents of your index.html file. It's probably a lbit boring right now, unless you went crazy on the "add some stuff" step. To start turning this into a functional blog, we'll have to add a few more folders to its root directory. Make folders called _pages and _includes. _pages will hold the non-post pages I mentioned earlier, and "includes" will hold stuff like headers, footers, and any other elements you'll want to reuse several times on your site. It's also a good idea to make a folder called "_data" and indide it make a file called global.yml. This file holds sitewide data like the site's URL, title, and author information, for use in your pages. It should look something like this:
```
# Site Settings
title: 'BenJen'
description: "The blog of Benjamin Jenkins. Theres some neat stuff here, 
or at least I think so."
url: 'http://benjen.me' # the base hostname & protocol for your site

# Admin Settings
admin_name: 'Benjamin Jenkins'
admin_email: 'ben@benjen.me'
```

## The Fun(ner) Stuff

Now it's time to start making the site look like a site. Make a new file in the _layouts folder called header.html, and another called footer.html . Thhe contents of these files will show up wherever you use the relevant {% raw %} {% include somefile.html %} {% endraw %} tag, likely in your layouts, which we'll get to next.

Take a look at this [Liquid Syntax information](http://shopify.github.io/liquid/basics/introduction/) to learn more about the Liquid templating language Jekyll uses.








