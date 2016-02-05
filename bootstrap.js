/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource:///modules/devtools/gDevTools.jsm");

/**
 * `osString` specifies the current operating system.
 * Go to https://developer.mozilla.org/docs/XPCOM_Interface_Reference/nsIXULRuntime
 * for more information.
 */
XPCOMUtils.defineLazyGetter(this, "osString", () =>
  Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS);

/**
 * `toolStrings` is a bundle containing localized strings.
 * Go to https://developer.mozilla.org/docs/Localization for more information.
 */
XPCOMUtils.defineLazyGetter(this, "toolStrings", () =>
  Services.strings.createBundle("chrome://fastrpc/locale/strings.properties"));

/**
 * `toolDefinition` is an object defining metadata about this add-on.
 * Go to https://developer.mozilla.org/docs/Tools/DevToolsAPI for information.
 */
XPCOMUtils.defineLazyGetter(this, "toolDefinition", () => ({
  // A unique id. Must not contain whitespace.
  id: "fastrpc",

  // The position of the tool's tab within the toolbox
  ordinal: 99,

  // Main keybinding modifiers.
  modifiers: osString == "Darwin" ? "accel,alt" : "accel,shift",

  // The url of the icon, displayed in the Toolbox.
  icon: "chrome://browser/skin/devtools/tool-network.svg",

  // A tool lives in its own iframe. The Toolbox will load this URL.
  url: "chrome://fastrpc/content/tool.xul",

  // The tool's name. Showed in Firefox' tool menu and in the Toolbox' tab.
  label: toolStrings.GetStringFromName("FastRPC.label"),

  // The tooltip text shown in the Toolbox's tab.
  tooltip: toolStrings.GetStringFromName("FastRPC.tooltip"),

  invertIconForLightTheme: true,

  // If the target is not supported, the toolbox will hide the tab.
  // Targets can be local or remote (used in remote debugging).
  isTargetSupported: function(target) {
    return target.isLocalTab;
  },

  // This function is called when the user select the tool tab.
  // It is called only once the toold definition's URL is loaded.
  build: function(iframeWindow, toolbox) {
    Cu.import("chrome://fastrpc/content/panel.js");
    let panel = new FastRPCPanel(iframeWindow, toolbox);
    return panel.open();
  }
}));

/**
 * Called when the extension needs to start itself up. This happens at
 * application launch time or when the extension is enabled after being
 * disabled (or after it has been shut down in order to install an update.
 * As such, this can be called many times during the lifetime of the application.
 *
 * This is when your add-on should inject its UI, start up any tasks it may
 * need running, and so forth.
 *
 * Go to https://developer.mozilla.org/Add-ons/Bootstrapped_extensions
 * for more information.
 */
function startup() {
  gDevTools.registerTool(toolDefinition);
}

/**
 * Called when the extension needs to shut itself down, such as when the
 * application is quitting or when the extension is about to be upgraded or
 * disabled. Any user interface that has been injected must be removed, tasks
 * shut down, and objects disposed of.
 */
function shutdown() {
  gDevTools.unregisterTool(toolDefinition);
  Services.obs.notifyObservers(null, "startupcache-invalidate", null);
}

/**
 * Called before the first call to startup() after the extension is installed,
 * upgraded, or downgraded.
 */
function install() {
}

/**
 * This function is called after the last call to shutdown() before a particular
 * version of an extension is uninstalled. This will not be called if install()
 * was never called.
 */
function uninstall() {
}
