package main

import "core:fmt"
import "core:mem"
import "core:os"
import "core:strings"
import cmark "vendor:commonmark"

print_help_message :: proc() {
	fmt.println("--- Static site generator ---", flush = false)
	fmt.println("Info: Turn a directory of markdown files into a static site.", flush = false)
	fmt.println("Usage: <program> <src folder> <dest folder>")
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
		if name, ext := os.split_filename(info.name); ext != "md" {
			continue
		}
		article_data := os.read_entire_file(info.fullpath, context.allocator) or_return
		article := cmark.parse_document(raw_data(article_data), len(article_data), cmark.Options{})
		defer cmark.node_free(article)
		handle_article(article, &html_builder)
		defer strings.builder_reset(&html_builder)

		output_path := os.join_path({dest_dir, info.name}, context.allocator) or_return
		output_path = os.join_filename(output_path, "html", context.allocator) or_return
		os.write_entire_file(
			output_path,
			strings.string_from_ptr(raw_data(html_builder.buf), len(html_builder.buf)),
		) or_return
	}
	return nil
}

handle_article :: proc(article: ^cmark.Node, b: ^strings.Builder) {
	article := cmark.node_first_child(article)
	_handle_article(article, b)
}

_handle_article :: proc(node: ^cmark.Node, b: ^strings.Builder) {
	node := node
	for node != nil {
		html_write_p(b, node_get_string(node))
		_handle_article(cmark.node_first_child(node), b)
		node = cmark.node_next(node)
	}
}

node_get_string :: proc(node: ^cmark.Node) -> string {
	return string(node.data[:node.len])
}

html_write_p :: proc(b: ^strings.Builder, text: string) {
	strings.write_string(b, "<p>\n")
	strings.write_string(b, text)
	strings.write_string(b, "\n</p>\n")
}

