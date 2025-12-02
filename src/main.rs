use std::collections::{HashMap};
use std::fs::{File};
use std::io::{Read};
use std::path::{PathBuf};

use petite_http::{self as ph, html, HttpOkay, HttpError};
use html::{Template};

// ----------------------------------------------------------------------------

type Properties = HashMap<&'static str, String>;

// ----------------------------------------------------------------------------

#[derive(Default, Debug, Clone)]
pub struct Nifki {}

impl Nifki {
    fn page_directory(&self, pagename: &str) -> PathBuf {
        let mut path = PathBuf::from("/home/apt1002/nifki/wiki");
        path.push(pagename);
        path
    }

    fn parse_properties(&self, pagename: &str) -> Result<Properties, HttpError> {
        let mut properties_path = self.page_directory(pagename);
        properties_path.push("properties.txt");
        let mut properties_text = String::new();
        File::open(properties_path)?.read_to_string(&mut properties_text)?;
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
}

impl ph::Route for Nifki {
    fn route(&mut self, path: &[String], _callback: impl ph::Callback) -> ph::Result {
        let mut path_iter = path.into_iter();
        let Some(page) = path_iter.next() else {
            return Ok(HttpOkay::Redirect("static/index.html".into()))
        };
        if page == "static" {
            let Some(filename) = path_iter.next() else {
                return Err(HttpError::NotFound);
            };
            let mut path = PathBuf::from("/home/apt1002/nifki/rust-nifki/static");
            path.push(filename);
            return Ok(HttpOkay::File {file: File::open(path)?, content_type: None});
        } else if page == "js" {
            let Some(filename) = path_iter.next() else {
                return Err(HttpError::NotFound);
            };
            let mut path = PathBuf::from("/home/apt1002/nifki/rust-nifki/js");
            path.push(filename);
            return Ok(HttpOkay::File {file: File::open(path)?, content_type: Some(ph::content_types::JS)});
        } else if page == "pages" {
            let Some(pagename) = path_iter.next() else {
                return Err(HttpError::Invalid);
            };
            let props: Properties = self.parse_properties(pagename)?;
            let Some(action) = path_iter.next() else {
                return Ok(HttpOkay::Redirect(format!("pages/{}/play", pagename)));
            };
            if action == "play" {
                return Ok(HttpOkay::Html(Box::new(Template(
                    include_str!("templates/play.html"),
                    Box::new([
                        ("name", Box::new(props["name"].clone())),
                        ("pagename", Box::new(pagename.clone())),
                    ]),
                ))));
            } else {
                return Err(HttpError::Invalid);
            }
        }
        return Err(HttpError::Invalid);
    }
}

// ----------------------------------------------------------------------------

fn main() {
    ph::start("localhost:8080".into(), None, Nifki::default());
}
