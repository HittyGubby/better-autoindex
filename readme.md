### Better autoindex for Nginx!

JUST SHOW ME HOW BETTER: try out [here](https://997779.xyz/share/)

BEFORE:

![](docs/before.png)

AFTER:

![](docs/after.png)


TL;DR: How to use

1. add `add_after_body` param under `location`: example:
```
server {...
        location /
		{
			...
			autoindex on;
			autoindex_exact_size on;
			autoindex_localtime on;
			add_after_body /.autoindex.html;
		}
	}
```
`autoindex_exact_size` must be on since customized file size display relies on that! (but its by default on anyways..)

`autoindex_localtime` is optional

2. compile project and get the single html file under dist/ or just download from release and put that under the root dir of your file share

3. (optional) 
    - you can absolutely put that html anywhere as long as its part of the shared file tree, also whatever name as long as correspondent to the config
	- currently using external electrolize font from google fonts, so maybe errors for offline access, also wikimedia for favicon

### Functionalities:
1. dark mode
2. auto size for columns
3. fixed default filename truncation
4. added file sorting (folders priority)
5. better parent folder navigation
6. better path breadcrumb
7. FANCY UI! (round corners, float, animations, shadows, fonts, etc.)
8. COMPONENTS!!1! (basically why im updating from a pure html js snippet to full blown vite project)
	- Codemirror for text, with code highlighting and auto text detection from mime, enabling for custom extension names
	- Picture preview, but zoom and panning doensnt work and idk why
	- video player using Plyr
	- a custom written audio player with playlist support, cross-href consistency
9. Avoids actual redirection
	- basically, it inhibits original redirection, fetches corresponding link and parses server content returned
	- using non-reloading href change to enable much faster loading and consistency for components and data stores
	- so u see result html is over 800kb but it basically just loads once, neat huh?
10. ahhhnu cheeki breeki iv damke
	- i mean if you are boring enough to notice my repo and even actually tries it out, then... you are quite the boring guy.

### Credits

got idea [here](https://github.com/tucke/nginx-autoindex)

after knowing this could be customized and i was like: wtf guys, hasnt this got its r/autoindexporn? 

uhh so yes i basically made this but no one's noticing lmao