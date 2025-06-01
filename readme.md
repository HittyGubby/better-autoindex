### Better autoindex for Nginx!
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

2. delete `delthis` in two filenames, and put them under the root dir of your file share

3. (optional) 
    - you can absolutely put the .autoindex.html anywhere as long as its part of the shared file tree
    - you can also use another font or just no font, whatever

### Credits

got idea [here](https://github.com/tucke/nginx-autoindex)

after knowing this could be customized and i was like: wtf guys, hasnt this got its r/autoindexporn? 