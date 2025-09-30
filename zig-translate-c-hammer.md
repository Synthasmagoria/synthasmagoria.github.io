# A solution to translate-c's current missing features
When you try adding C code to your Zig project that uses bit fields then it will result in an opaque struct. Such was the case when I tried using ZPL. The base node class `zpl_adt_node` had a bit field and so I couldn't actually access its members in Zig. The solution is to mimick the memory layout of the opaque C struct in Zig and then cast the opaque type to it. Here's how I discovered this:

## Trying to parse JSON5 out of all things
When I started looking into JSON5 parsing in Zig one thing quickly became obvious: None of the parsers have up-to-date support of the JSON5 standard.
- std.json doesn't support JSON5
- [Himujjal's zig-json5](https://github.com/Himujjal/zig-json5/tree/master) can't parse the example snippet from json5.org
- [berdon's zig-json](https://github.com/berdon/zig-json) only supports the JSON5 1.0.0 spec from 2018

Then I remembered that Zig has interoperability with C. So I broadened my search to include C libraries. And I quickly found ZPL, and its JSON5 parser.

## Getting ZPL to work in Zig
ZPL can be used as a single header library. In fact that's the recommended way to use it as listed on their github.
```
curl -L https://zpl.pw/ > zpl.h
```
How to go about including this library in the project wasn't immediately obvious though. I tried just adding the header file as a C source, and doing a @cImport. And although it seemed to work at first it resulted in two problems.
1. Only ZPL declarations were added to the project, not implementations.
2. `zpl_adt_node` - which is a generic struct used for various data structure things in the ZPL library - was made opaque. The reason being that translate-c doesn't support the conversion of C bitfields.

## Adding the implementations
Issue '1' is caused by the ZPL_IMPLEMENTATION not being defined. Which means that the compiler has no way to include the implementations in the file, they'd be preprocessor-macrod out. There are two ways to fix this.
1. `zig translate-c` with a `-D` flag that defines ZPL_IMPLEMENTATION
2. Create zpl.c, define ZPL_IMPLEMENTATION, include zpl.h, and add it as a C source file in build.zig
The latter is preferred over the former because it would run `translate-c` on the zpl implementation code. Which is unnecessary because it creates more generated code in the project and `translate-c` is apparently not meant to translate complicated implementation code. (I read this somewhere, but I don't have the link anymore).

## Testing if ZPL actually works for me
At this point issue '2' was bugging me. I could immediately spend my time replicating the memory layout of `zpl_adt_node` is Zig, however I wanted to make sure that ZPL JSON5 can actually parse a YYP file.
Yeah sure, I may not be able to allocate an instance of `zpl_adt_node` in order to receieve data from `zpl_json_parse`. However, I could just allocate a buffer, cast the pointer, and pass it as if it were a `zpl_adt_node`. As I'm not well versed in low level programming, stuff like this is not always immediately obvious. At this level it is certainly cool to be able to think of everything in terms of memory, instead of having to deal with abstract data structures.

So I wrote the following code:
```zig
const std = @import("std");
const Allocator = std.mem.Allocator;
const c = @cImport({@cInclude("zpl.h");});
const print = std.debug.print;

fn file_read_to_end_alloc(path: []const u8, alloc: Allocator) ![:0]const u8 {
    const f = try std.fs.cwd().openFile(path, .{});
    return try f.readToEndAllocOptions(alloc, std.math.maxInt(usize), null, @alignOf(u8), 0);
}

pub fn main() !void {
    const a = std.heap.page_allocator;
    const k3plus_string = try file_read_to_end_alloc("k3plus.yyp", a);
    const node_buffer = try a.alloc(u8, 32);
    const zpl_a = c.zpl_heap_allocator();
    const err = c.zpl_json_parse(
        @ptrCast(node_buffer.ptr),
        @constCast(@ptrCast(k3plus_string.ptr)),
        zpl_a);
    print("{d}\n", .{err});
}
```
And indeed, the error code was 0, aka. ZPL_JSON_NO_ERROR
Well, it was zero no matter how little memory I allocated for the buffer. Which is a little concerning considering its probably writing into other parts of memory beyond my buffer without triggering a segmentation fault. My theory is that the page_allocator probably asks for more than 32 bits of memory, even though I only ask for that much. And running the following command in the terminal:
```shell
getconf PAGE_SIZE
```
Writes the number 4096, meaning that it most likely allocated 4096 bytes behind the scenes. Though that's only an assumption for now.

## Idea: just recreate the struct
The solution I came up with for tackling the issue of `zpl_adt_node` not being translated by `translate-c` was to just create it myself. Zig has bitfields and packed structs, so I should theoretically be able to recreate the C struct exactly, right?

To start out with I added the struct a C file and sizeof'd it. The result was 32.
```c
typedef struct zpl_adt_node {
    char const *name;
    struct zpl_adt_node *parent;
    uint8_t type        :4;
    uint8_t props       :4;
    union {
        char const *string;
        struct zpl_adt_node *nodes;
        struct {
            union {
                double real;
                double integer;
            };
        };
    };
} zpl_adt_node;
```
This makes sense when compiling for 64bit:
```
char const* = 8 bytes

struct zpl_adt_node* = 8 bytes

uint8_t :4;
uint8_t :4; = 1 byte + 7 bytes offset to align

union {
	char const*
	struct zpl_adt_node*
	struct {union {double real; double integer;};};
}; = 8 bytes
```
Recreating this in Zig was a matter of using a combination of extern/packed structs/unions.
```zig
const ZplAdtNode = extern struct {
    name: [*:0]u8,
    parent: *ZplAdtNode,
    properties: packed struct {
        type: u4,
        props: u4,
    },
    data: extern union {
        string: [*:0]u8,
        nodes: [*]ZplAdtNode,
        value: extern union {
            real: f64,
            integer: f64
        }
    }
};
```
With this I was able to parse the first two nodes of my JSON5 sample code
```zig
var json5 =
    \\{
    \\  "foo": [
    \\    null,
    \\    true,
    \\    false,
    \\    "bar",
    \\    {
    \\      "baz": -13e+37
    \\    }
    \\  ]
    \\}
.*;

pub fn main() !void {
    var node: ZplAdtNode = undefined;
    const node_ptr: *c.zpl_adt_node = @ptrCast(&node);
    const a = c.zpl_heap_allocator();
    _ = c.zpl_json_parse(node_ptr, &json5[0], a);
    _ = @as([*]ZplAdtNode, @ptrCast(node.data.nodes))[0];
}
```

With this working I could start using zpl for real to create the program I wanted.
*Sidenote: zpl_array_count() blew my mind when I found out how it works*

## Then I went on to make these two tools:
- [Gamemaker Path Corrector](https://github.com/Synthasmagoria/gamemaker-path-corrector)
- [Gamemaker Project Cleaner](https://github.com/Synthasmagoria/gamemaker-project-cleaner)
