# Register

This is an [Electron][1] app that performs image registration using [BROCCOLI][2]. This app is compatible with macOS and Linux. Windows support is limited by BROCCOLI but may be available in the future.

Register supports `.mat` and `.h5` files as input and will create an output file named `registeredImages.mat`.

## Installation

To run this app, you'll need Python 3 with these libraries:

- scipy
- numpy
- nibabel
- hdf5storage

Once these are installed, run `pyinstaller register.py` to create the executable Python script. If an error referencing `scipy._lib.messagestream` appears, then add `scipy._lib.messagestream` as a hidden import in `register.spec`, and then run `pyinstaller register.spec`. After this, run `npm install` and `electron .` to run the app.

To create a macOS app, just install [electron-packager][3] and run `electron-packager .`. This will create a new directory containing an executable `Register.app` file. On Linux, install electron-packager and [electron-installer-debian][4] and run `electron-packager .` followed by `electron-installer-debian --src <Path to Register.app> --dest . --arch amd64`. This will create an installable `.deb` file.

## Author

Satyam Ghodasara ([@sxg][5])—[sdg46@case.edu][6]

## License

[CC0 1.0 (Public Domain)][7]

[1]:	https://github.com/electron/electron "Electron"
[2]:	https://github.com/wanderine/BROCCOLI "BROCCOLI"
[3]:    https://github.com/electron-userland/electron-packager "electron-packager"
[4]:    https://github.com/unindented/electron-installer-debian "electron-installer-debian"
[5]:	https://github.com/sxg "sxg"
[6]:	mailto:sdg46@case.edu
[7]:	LICENSE.md