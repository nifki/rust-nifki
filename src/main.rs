use std::collections::{HashMap};
use std::{env};
use std::fs::{File};
use std::path::{Path, PathBuf};

use petite_http::{self as ph, html, HttpOkay, HttpError};
use html::{Escape, Raw, Concat, Template};

// ----------------------------------------------------------------------------

type Properties = HashMap<&'static str, String>;

// ----------------------------------------------------------------------------

/// Appends copies of `pad` to `items` until its length is a multiple of
/// `group_size`. Then groups the items 'group_size' at a time and returns a list
/// of groups.
fn group<T>(items: Vec<T>, group_size: usize, pad: impl Fn() -> T) -> Vec<Vec<T>> {
    let num_rows = items.len().div_ceil(group_size);
    let mut ret = Vec::new();
    let mut iter = items.into_iter();
    for _ in 0..num_rows {
        let mut row = Vec::new();
        for _ in 0..group_size {
            row.push(iter.next().unwrap_or_else(&pad));
        }
        ret.push(row);
    }
    ret
}

// ----------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct Nifki {
    /// The filesystem path of the wiki data directory.
    wiki_root: Box<Path>,

    /// The filesystem path of the `js` directory.
    js_root: Box<Path>,

    /// The filesystem path of the `static` directory.
    static_root: Box<Path>,
}

impl Nifki {
    fn page_directory(&self, pagename: &str) -> PathBuf {
        let mut path = PathBuf::from(&*self.wiki_root);
        path.push(pagename);
        path
    }

    fn parse_properties(&self, pagename: &str) -> Result<Properties, HttpError> {
        let mut properties_path = self.page_directory(pagename);
        properties_path.push("properties.txt");
        let properties_text = std::fs::read_to_string(properties_path)?;
        let mut props: Properties = HashMap::from_iter([
            ("name", "".into()),
            ("width", "256".into()),
            ("height", "256".into()),
            ("msPerFrame", "40".into()),
            ("debug", "false".into()),
        ]);
        for line in properties_text.lines() {
            let line = line.split("#").next().unwrap().trim();
            if line == "" { continue; }
            let Some(colon) = line.find(":") else {
                Err(HttpError::Error("invalid property".into()))?
            };
            let key = line[..colon].trim();
            let value = line[colon + 1..].trim();
            if let Some(val) = props.get_mut(key) { *val = value.into(); };
        }
        Ok(props)
    }

    fn edit_page(&self, pagename: String, error_message: Option<String>, source: String, properties: Properties, newpage: String) -> ph::Result {
        // Wrap up 'error_message' in an HTML paragraph.
        let error_message = if let Some(error_message) = error_message {
            Template(
                "<p class=\"error\" align=\"center\">{error_message}</p>",
                Box::new([("error_message", Box::new(error_message))]),
            )
        } else { Template("", Box::new([])) };

        // Compile a list of the images attached to the page.
        let mut image_list = Vec::new();
        let mut image_path = self.page_directory(&pagename);
        image_path.push("res");
        std::fs::create_dir_all(&image_path)?;
        for dir_entry in image_path.read_dir()? {
            let image = String::from(dir_entry?.path().file_name().unwrap().to_str().unwrap());
            if !image.starts_with(".") { image_list.push(image); }
        }
        image_list.sort();
        let image_list: Vec<Box<dyn Escape>> = image_list.into_iter().map(
            |image| Box::new(Template(
                include_str!("templates/fragments/edit-image.html"),
                Box::new([
                    ("pagename", Box::new(pagename.clone())),
                    ("image", Box::new(image)),
                ]),
            ),
        ) as Box<dyn Escape>).collect();
        let image_list: Concat = group(image_list, 5, || Box::new(Raw("     <td></td>\n"))).into_iter().map(
            |row| {
                Concat(Box::new([
                    Box::new(Raw("    <tr>\n")),
                    Box::new(Concat::from_iter(row.into_iter())) as Box<dyn Escape>,
                    Box::new(Raw("    </tr>")),
                ]))
            }
        ).collect();
        let image_list: Box<dyn Escape> = if image_list.0.len() == 0 {
            Box::new(Raw("   <p align=\"center\">No pictures</p>"))
        } else {
            Box::new(Template(
                "   <table cols=\"5\" rows=\"{num_rows}\" align=\"center\">\n{image_list}\n   </table>",
                Box::new([
                    ("num_rows", Box::new(image_list.0.len())),
                    ("image_list", Box::new(image_list)),
                ]),
            ))
        };

        let is_debug_checked = properties["debug"].parse().map_err(|e| HttpError::Error(Box::new(e)))?;

        return Ok(HttpOkay::Html(Box::new(Template(
            include_str!("templates/edit.html"),
            Box::new([
                ("pagename", Box::new(pagename)),
                ("error_message", Box::new(error_message)),
                ("source", Box::new(source)),
                ("width", Box::new(properties["width"].clone())),
                ("height", Box::new(properties["height"].clone())),
                ("msPerFrame", Box::new(properties["msPerFrame"].clone())),
                ("name", Box::new(properties["name"].clone())),
                ("debug_checked", Box::new(if is_debug_checked {"checked"} else {""})),
                ("image_list", image_list),
                ("new_page", Box::new(newpage)),
                ("uploaded_image", Box::new("")),
            ]),
        ))));
    }
}

impl ph::Route for Nifki {
    fn route(&mut self, path: &[String], _callback: impl ph::Callback) -> ph::Result {
        let mut path_iter = path.into_iter();
        let Some(page) = path_iter.next() else {
            return Ok(HttpOkay::Redirect("pages".into()))
        };
        if page == "static" {
            let mut path = PathBuf::from(&*self.static_root);
            for filename in path_iter {
                path.push(filename);
            }
            return Ok(HttpOkay::File {file: File::open(path)?, content_type: None});
        } else if page == "js" {
            let Some(filename) = path_iter.next() else {
                return Err(HttpError::NotFound);
            };
            let mut path = PathBuf::from(&*self.js_root);
            path.push(filename);
            return Ok(HttpOkay::File {file: File::open(path)?, content_type: Some(ph::content_types::JS)});
        } else if page == "stylesheet.css" {
            return Ok(HttpOkay::Chars {data: include_str!("stylesheet.css").into(), content_type: ph::content_types::CSS});
        } else if page == "pages" {
            let Some(pagename) = path_iter.next() else {
                let mut all_pages = Vec::new();
                for dir_entry in self.wiki_root.read_dir()? {
                    let page = String::from(dir_entry?.path().file_name().unwrap().to_str().unwrap());
                    if !page.starts_with(".") && page != "nifki-out" { all_pages.push(page); }
                }
                all_pages.sort();
                let page_links: Concat = all_pages.into_iter().map(
                    |page| Template(
                        "   <li><a href=\"/pages/{page}/play\">{page}</a></li>",
                        Box::new([("page", Box::new(format!("{}", page)))]),
                    ),
                ).collect();
                return Ok(HttpOkay::Html(Box::new(Template(
                    include_str!("templates/list-of-all-pages.html"),
                    Box::new([
                        ("title", Box::new("List of All Pages")),
                        ("page_names", Box::new(page_links))
                    ]),
                ))));
            };
            let props: Properties = self.parse_properties(pagename)?;
            let Some(action) = path_iter.next() else {
                return Ok(HttpOkay::Redirect(format!("pages/{}/play", pagename)));
            };
            if action == "play" {
                let mut path = PathBuf::from(&*self.wiki_root);
                path.push("nifki-out");
                path.push(format!("{}.jar", pagename));
                if path.exists() {
                    return Ok(HttpOkay::Html(Box::new(Template(
                        include_str!("templates/play.html"),
                        Box::new([
                            ("name", Box::new(props["name"].clone())),
                            ("width", Box::new(props["width"].clone())),
                            ("height", Box::new(props["height"].clone())),
                            ("msPerFrame", Box::new(props["msPerFrame"].clone())),
                            ("debug", Box::new(props["debug"].clone())),
                            ("pagename", Box::new(pagename.clone())),
                        ]),
                    ))));
                }
                let mut path = PathBuf::from(&*self.wiki_root);
                path.push("nifki-out");
                path.push(format!("{}.err", pagename));
                if path.exists() {
                    let err = std::fs::read_to_string(path)?;
                    let err = textwrap::fill(&err, 80);
                    return Ok(HttpOkay::Html(Box::new(Template(
                        include_str!("templates/compiler-output.html"),
                        Box::new([
                            ("pagename", Box::new(pagename.clone())),
                            ("err", Box::new(err)),
                        ]),
                    ))));
                }
                return Ok(HttpOkay::Redirect(format!("pages/{}/edit", pagename)));
            } else if action == "edit" {
                let mut source_file = self.page_directory(pagename);
                source_file.push("source.sss");
                let source = std::fs::read_to_string(source_file)?;
                let props: Properties = self.parse_properties(pagename)?;
                return self.edit_page(pagename.clone(), None, source, props, pagename.clone());
            } else if action == "res" {
                let Some(image_name) = path_iter.next() else {
                    return Err(HttpError::NotFound);
                };
                let mut path = self.page_directory(pagename);
                path.push("res");
                path.push(image_name);
                return Ok(HttpOkay::File {file: File::open(path)?, content_type: None});
            } else if let Some(_) = ph::remove_extension(action, "jar") {
                let mut path = PathBuf::from(&*self.wiki_root);
                path.push("nifki-out");
                path.push(format!("{}.jar", pagename));
                return Ok(HttpOkay::Bytes {data: std::fs::read(path)?, content_type: ph::content_types::JAR});
            } else {
                return Err(HttpError::Invalid);
            }
        }
        return Err(HttpError::Invalid);
    }
}

// ----------------------------------------------------------------------------

/// The default value of [`Nifki::WIKI_ROOT`].
pub const WIKI_ROOT: &'static str = "/home/apt1002/nifki/wiki";

/// The default value of [`Nifki::JS_ROOT`].
pub const JS_ROOT: &'static str = "/home/apt1002/nifki/platform/html5/js";

/// The default value of [`Nifki::STATIC_ROOT`].
pub const STATIC_ROOT: &'static str = "/home/apt1002/nifki/rust-nifki/static";

fn main() {
    let wiki_root = env::var("NIFKI_WIKI_ROOT").unwrap_or_else(|_| WIKI_ROOT.to_owned());
    let js_root = env::var("NIFKI_JS_ROOT").unwrap_or_else(|_| JS_ROOT.to_owned());
    let static_root = env::var("NIFKI_STATIC_ROOT").unwrap_or_else(|_| STATIC_ROOT.to_owned());
    let server = Nifki {
        wiki_root: Path::new(wiki_root.as_str()).into(),
        js_root: Path::new(js_root.as_str()).into(),
        static_root: Path::new(static_root.as_str()).into(),
    };
    ph::start("localhost:8080".into(), None, server);
}
