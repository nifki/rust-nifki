use std::fs::{File};
use std::path::{PathBuf};

use petite_http::{self as ph, HttpOkay, HttpError};

// ----------------------------------------------------------------------------

#[derive(Default, Debug, Clone)]
pub struct Nifki {}

impl Nifki {}

impl ph::Route for Nifki {
    fn route(&mut self, path: &[String], _callback: impl ph::Callback) -> ph::Result {
        let mut path_iter = path.into_iter();
        let Some(page) = path_iter.next() else {
            return Ok(HttpOkay::Redirect("static/index.html".into()))
        };
        if page == "static" {
            let Some(page) = path_iter.next() else {
                return Err(HttpError::NotFound);
            };
            let mut path = PathBuf::from("/home/apt1002/nifki/nifki-js");
            path.push(page);
            return Ok(HttpOkay::File(File::open(path)?));
        }
        return Err(HttpError::Invalid);
    }
}

// ----------------------------------------------------------------------------

fn main() {
    ph::start("localhost:8080".into(), None, Nifki::default());
}
