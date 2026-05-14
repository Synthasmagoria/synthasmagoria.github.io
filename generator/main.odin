package main

import "core:fmt"
import "core:mem"
import "core:os"
import "core:strings"
import cmark "vendor:commonmark"

HIGHLIGHTJS_DIR :: "./highlightjs-cdn-release/build/"

HEADER ::
"<!doctype html>\n" +
"<head>\n" +
"   <title>Synthasmablogia</title>\n" +
"   <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n" +
"   <script src=\"https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js\"></script>\n" +
"   <link href=\"style.css\" rel=\"stylesheet\" />\n" +
"	<link href=\"" + HIGHLIGHTJS_DIR + "styles/gml.min.css\" rel=\"stylesheet\" />\n" +
"</head>\n" +
"<body>\n" +
"	<canvas id=\"background\"></canvas>\n" +
"	<script src=\"app.js\"></script>\n" +
"	<div class=\"article-content\">"

FOOTER ::
"	</div>\n" +
"</body>\n"

print_help_message :: proc() {
	fmt.println(
		"--- Static site generator ---\n" +
		"Info: Turn a directory of markdown files into a static site.\n" +
		"Usage: <program> <src folder> <dest folder>")
}

main :: proc() {
	switch len(os.args) {
	case 0, 1:
		print_help_message()
	case 2:
		fmt.println("Error: Too few arguments")
		print_help_message()
	case 3:
		error := program(os.args[1], os.args[2])
		if error != nil {
			fmt.println("Error: program exited with", error)
		}
	case 4:
		fmt.println("Error: Too many arguments")
		print_help_message()
	}
}

ProgramError :: union {
	enum {
		SourceDirNotExist,
		DestDirNotExist,
	},
	mem.Allocator_Error,
	os.Error,
}

program :: proc(src_dir, dest_dir: string) -> ProgramError {
	if !os.is_directory(src_dir) {
		return .SourceDirNotExist
	}
	if !os.is_directory(dest_dir) {
		return .DestDirNotExist
	}
	walker := os.walker_create_path(src_dir)
	html_builder := strings.builder_make()
	for info, ok := os.walker_walk(&walker); ok; info, ok = os.walker_walk(&walker) {
		name, ext := os.split_filename(info.name)
		if ext != "md" {
			continue
		}
		article_data := os.read_entire_file(info.fullpath, context.allocator) or_return
		article := cmark.parse_document(raw_data(article_data), len(article_data), cmark.Options{})
		body := cmark.render_html(article, {})
		defer cmark.node_free(article)

		languages := md_extract_code_block_languages(string(article_data))

		strings.write_string(&html_builder, HEADER)
		strings.write_string(&html_builder, strings.clone_from_cstring(body))
		html_write_script_tag_src(&html_builder, HIGHLIGHTJS_DIR + "highlight.min.js")
		for language in languages {
			path := strings.concatenate({HIGHLIGHTJS_DIR, "languages/", language, ".min.js"}) or_return
			if os.exists(path) {
				html_write_script_tag_src(&html_builder, path)
			}
		}
		html_write_script_tag_code(&html_builder, "hljs.highlightAll();")
		strings.write_string(&html_builder, FOOTER)
		html := strings.to_string(html_builder)
		defer strings.builder_reset(&html_builder)

		output_path := os.join_path({dest_dir, name}, context.allocator) or_return
		output_path = os.join_filename(output_path, "html", context.allocator) or_return
		os.write_entire_file(output_path, html) or_return
	}
	return nil
}

MD_CODE_BLOCK_MARKER :: "```"
md_extract_code_block_languages :: proc(md: string, alloc := context.allocator) -> map[string]int {
	context.allocator = alloc
	languages := make(map[string]int)
	pos: int
	for true {
		if code_block_pos := strings.index(md[pos:], MD_CODE_BLOCK_MARKER); code_block_pos != -1 {
			pos += code_block_pos + len(MD_CODE_BLOCK_MARKER)
		} else {
			break
		}
		newline_pos := strings.index(md[pos:], "\n")
		if newline_pos == -1 {
			break
		}
		newline_pos += pos

		if pos == newline_pos {
			continue
		}
		language := strings.trim_space(md[pos:newline_pos])
		languages[language] = 0
	}
	return languages
}

html_write_script_tag_src :: proc(b: ^strings.Builder, src: string) {
	strings.write_string(b, "<script src=\"")
	strings.write_string(b, src)
	strings.write_string(b, "\"></script>\n")
}

html_write_script_tag_code :: proc(b: ^strings.Builder, code: string) {
	strings.write_string(b, "<script>\n")
	strings.write_string(b, code)
	strings.write_string(b, "\n</script>\n")
}
