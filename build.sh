#!/bin/bash


SAVED_DIR="$PWD"
BUILD_DIR="$SAVED_DIR/build"
BUILD_DIR_LIST="src target packages install"
PACKAGE_JSON="package.json"
VERSION_JSON="version.json"
#IGNORE_LIST="node_modules/* build/*"
IGNORE_LIST="/.* /build/* /DEVEL-NOTES.md"
SRC_DIR="build/src"
EXTRA_PARAMS=""
#DEPS="zip wine"
DEPS="zip"

NODE_PATH="${NODE_PATH:=/usr/lib/node_modules}"
DYLD_FALLBACK_LIBRARY_PATH="/usr/local/lib:/lib:/usr/lib"

_my_exit() {

    local EXIT_CODE

    [ "$1" != "" ] && EXIT_CODE="$1" || EXIT_CODE="0"

    # Change to saved directory (with pushd) before we exit
    cd "$SAVED_DIR"

    exit "$EXIT_CODE"
}

_init_build()  {

    set | grep '^APP_'
    echo "IGNORE_LIST=$IGNORE_LIST"
    echo "EXTRA_PARAMS=$EXTRA_PARAMS"
    echo "NODE_PATH=$NODE_PATH"

    echo ""
    if [ -d "$BUILD_DIR" ]; then
        echo "Removing existing build directory: $BUILD_DIR"
        rm -rf "$BUILD_DIR"
    fi

    echo "Creating build directories: "
    for TMP_DIR in $BUILD_DIR_LIST; do
        mkdir -v -p "$BUILD_DIR/$TMP_DIR"
        [ $? -ne 0 ] && _my_exit $?
    done
    echo ""

    cp -f nomic.js package.json LICENSE README.md usage.txt version.json "$SRC_DIR"

    unalias which > /dev/null 2>&1

    for DEP in $DEPS; do
        # Check if dependency is installed
        which "$DEP" > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "Error: '$DEP' command not found. Exiting..."
            _my_exit 1
        fi
    done
    # Save and unset DISPLAY to workaround a bug (?) with electron-packager for windows, where it hangs with any console message
    echo "Display: $DISPLAY"
    export SAVED_DISPLAY="$DISPLAY"
    unset DISPLAY

}


_create_version_json()  {

    if [ ! -f "$PACKAGE_JSON" ]; then
            echo "Error: Mandatory file package.json not found in local directory. Exiting..."
            exit 2
    fi

    APP_FILENAME="$(sed '/name/!d;s/\(.*\)\("name": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_NAME="$(sed '/productName/!d;s/\(.*\)\("productName": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_VERSION="$(sed '/version/!d;s/\(.*\)\("version": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_DESCRIPTION="$(sed '/description/!d;s/\(.*\)\("description": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_AUTHOR="$(sed '/author/!d;s/\(.*\)\("author": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_LICENSE="$(sed '/license/!d;s/\(.*\)\("license": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_HOMEPAGE_URL="$(sed '/homepage/!d;s/\(.*\)\("homepage": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_SUPPORT_URL="$(sed '/\(.*\)"bugs": {/,/},/!d;/url/!d;s/\(.*\)\("url": "\([^"]*\)"\)\(.*\)/\3/' < "$PACKAGE_JSON")"
    APP_COPYRIGHT="Copyright (c) $(date +%Y), $APP_AUTHOR"

    [ "$TRAVIS_BUILD_NUMBER" != "" ] && APP_BUILD_VERSION="$TRAVIS_BUILD_NUMBER" || APP_BUILD_VERSION="0000"

    cat > "$VERSION_JSON" <<EOF
{
    "name": "$APP_NAME",
    "version": "$APP_VERSION",
    "build": "$APP_BUILD_VERSION",
    "description": "$APP_DESCRIPTION",
    "author": "$APP_AUTHOR",
    "copyright": "$APP_COPYRIGHT",
    "license": "$APP_LICENSE",
    "homepageURL": "$APP_HOMEPAGE_URL",
    "supportURL": "$APP_SUPPORT_URL"
}
EOF
}


case "$1" in

        win32)
            APP_PLATFORM="win32"
            APP_ARCH="ia32"
            #APP_ICON="$SAVED_DIR/src/majin.ico"
            #export DISPLAY=$SAVED_DISPLAY
            ;;
        win64)
            APP_PLATFORM="win32"
            APP_ARCH="x64"
            #APP_ICON="$SAVED_DIR/src/majin.ico"
            #export DISPLAY=$SAVED_DISPLAY
            ;;
        linux32)
            APP_PLATFORM="linux"
            APP_ARCH="ia32"
            #APP_ICON="$SAVED_DIR/src/majin.ico"
            ;;
        linux64)
            APP_PLATFORM="linux"
            APP_ARCH="x64"
            #APP_ICON="$SAVED_DIR/src/majin.ico"
            ;;
        darwin)
            APP_PLATFORM="darwin"
            APP_ARCH="x64"
            #APP_ICON="$SAVED_DIR/src/images/icon@5.hqx"
            ;;
        mas)
            APP_PLATFORM="mas"
            APP_ARCH="x64"
            #APP_ICON="$SAVED_DIR/src/images/icon@5.hqx"
            ;;
        all)
            APP_PLATFORM="all"
            APP_ARCH="all"
            #APP_ICON="$SAVED_DIR/src/majin.ico"
            ;;
        *)
            echo ""
            echo " usage: ${0##*/} [win32|win64|linux32|linux64|darwin|mas|all]"
            echo ""
            _my_exit 2
            ;;
esac

echo "Building application..."
echo ""

_create_version_json

_init_build

echo "Installing build dependencies..."
npm install 
npm install --save
npm install --save-dev

echo ""
electron-packager "$SRC_DIR" "$APP_NAME" \
--platform="$APP_PLATFORM" \
--arch="$APP_ARCH" \
--icon="$APP_ICON" \
--version-string.CompanyName="$APP_AUTHOR" \
--version-string.ProductName="$APP_NAME" \
--version-string.OriginalFilename="${APP_FILENAME}.exe" \
--version-string.InternalName="$APP_NAME" \
--app-FileDescription="$APP_DESCRIPTION" \
--app-copyright="$APP_COPYRIGHT" \
--app-version="$APP_VERSION" \
--build-version="$APP_VERSION" \
--download.strictSSL \
--ignore="$IGNORE_LIST" \
--overwrite \
--asar \
--out="$BUILD_DIR/target" \
"$EXTRA_PARAMS"
if [ $? -ne 0 ]; then
    echo "Error: An unexpected error ocurred. Check output formore information. Exiting..."
    _my_exit 1
fi

cd "$BUILD_DIR/target"

echo ""
echo "Creating Packages: "
for PKG_NAME in *; do

    echo "- Creating ZIP package '${PKG_NAME}.zip'"

    #cp -f "$SAVED_DIR/src/majin.ico" "$BUILD_DIR/target/$PKG_NAME/"
    #if [ $? -ne 0 ]; then
        #echo "Error: file not found (majin.ico). Exiting..."
        #_my_exit 1
    #fi


    zip -qo9r "../packages/${PKG_NAME}.zip" "$PKG_NAME"
    if [ $? -ne 0 ]; then
        echo "Error: An unexpected error ocurred. Check output formore information. Exiting..."
        _my_exit 1
    fi

    echo ""

    #echo "$PKG_NAME" | grep -q 'win32'
    #if [ $? -eq 0 ]; then
    #    export DISPLAY=$SAVED_DISPLAY
    #    [ ! -d "$BUILD_DIR/ispack" ] && git clone https://github.com/jrsoftware/ispack "$BUILD_DIR/ispack"
    #    set -x 
        #wine "$BUILD_DIR/ispack/isfiles-unicode/ISCC.exe" /DAppBuildDir="$BUILD_DIR/target/${PKG_NAME}" /O"$BUILD_DIR/install" /F"${PKG_NAME}-setup" "..\\setup\\setup-wine.iss"
        #[ $? -ne 0 ] && echo "WARNING: Installation Setup exited with errors. Check output for further information."
    #fi
done

cd "$SAVED_DIR"

echo "Finished successfuly."

exit 0
