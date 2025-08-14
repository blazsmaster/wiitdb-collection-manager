# WiiTDB Collection Manager

A little personal project to browse and manage your Wii game catalog provided by WiiTDB. This application allows you to browse and manage a static database of Wii games for creating personla collections, marking games which you have/own, and viewing detailed information about each game.

## Features

- [x] Import and parse WiiTDB XML files
- [ ] Browse your Wii game collection with detailed information
- [x] Store game data locally in your browser
- [x] Sort and filter games by various criteria
- [ ] Mark games as owned or not owned
- [x] Search for games by title or other attributes
- [ ] Create and manage personal collections
- [ ] Per game details view with cover art, disc images, and detailed descriptions
- [ ] Save and export your collection data (snapshots)

## Requirements

- PHP 7.0 or higher
- Web server (Apache, Nginx, etc.)
- Modern web browser with JavaScript and localStorage support

## Installation

*Project is not yet ready for production use, but you can still try it out!*

## Usage

1. On first load, the application will automatically import the XML data from your WiiTDB file.
   - If you clear all website data or local storage, the application will re-import the XML file.
   - You can provide your own WiiTDB XML file by placing it in the `assets/xml/` directory. (watch out for the file name)
2. The games will be displayed in a sortable table with all available information.
3. The data is stored in your browser's local storage for faster access on subsequent visits.
   - This is a client-side application, so no server-side database is required. (only the static WiiTDB XML file is needed)

## Customization

You can customize the application by modifying the following files:

- `includes/config.php` - Change site title, language, and other static settings

## About WiiTDB

WiiTDB is a database containing information about Wii games. This application uses XML data from WiiTDB to help you manage and browse your game collection.

[gametdb.com > Wii Downloads](https://www.gametdb.com/Wii/Downloads) `wiitdb.zip`

## License

This project is licensed under the terms of the included LICENSE file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
