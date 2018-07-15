/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding initialization code.
 * Use "quasar new plugin <name>" and add it there.
 * One plugin per concern. Then reference the file(s) in quasar.conf.js > plugins:
 * plugins: ['file', ...] // do not add ".js" extension to it.
 **/
<% if (supportIE) { %>
import 'quasar-framework/dist/quasar.ie.polyfills.js'
<% } %>

<% if (ctx.dev) { %>
console.info('[Quasar] Running <%= ctx.modeName.toUpperCase() + (ctx.mode.ssr && ctx.mode.pwa ? ' + PWA' : '') %> with <%= ctx.themeName.toUpperCase() %> theme.')
<% if (ctx.mode.pwa) { %>console.info('[Quasar] Forcing PWA into the network-first approach to not break Hot Module Replacement while developing.')<% } %>
<% } %>

import Vue from 'vue'
Vue.config.productionTip = <%= ctx.dev ? false : true %>

import createApp from './app.js'

<% if (ctx.mode.pwa) { %>
import 'app/<%= sourceFiles.registerServiceWorker %>'
<% } %>

const { app, <%= store ? 'store, ' : '' %>router } = createApp()

<%
if (plugins) {
  function hash (str) {
    const name = str.replace(/\W+/g, '')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  const pluginNames = []
  plugins.filter(asset => asset.path !== 'boot' && asset.client !== false).forEach(asset => {
    let importName = 'plugin' + hash(asset.path)
    pluginNames.push(importName)
%>
import <%= importName %> from 'src/plugins/<%= asset.path %>'
<%
})
if (pluginNames.length > 0) {
%>
;[<%= pluginNames.join(',') %>].forEach(plugin => plugin({
  app,
  router,
  <%= store ? 'store,' : '' %>
  Vue,
  ssrContext: null
}))
<% } } %>

<% if (preFetch) { %>
import { addPreFetchHooks } from './client-prefetch.js'
<% } %>

<% if (ctx.mode.ssr) { %>

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
<% if (store) { %>
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
<% } %>

const appInstance = new Vue(app)

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  <% if (preFetch) { %>
  addPreFetchHooks(router<%= store ? ', store' : '' %>)
  <% } %>
  appInstance.$mount('#q-app')
})

<% } else { // not SSR %>

<% if (preFetch) { %>
addPreFetchHooks(router<%= store ? ', store' : '' %>)
<% } %>

<%
const hasBootPlugin = plugins && plugins.find(asset => asset.path === 'boot')

if (hasBootPlugin) { %>
import boot from 'src/plugins/boot.js'
<% } %>

<% if (ctx.mode.electron) { %>
import electron from 'electron'
Vue.prototype.$q.electron = electron
<% } %>

<% if (ctx.mode.pwa) { %>
import FastClick from 'fastclick'
// Needed only for iOS PWAs
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && window.navigator.standalone) {
  document.addEventListener('DOMContentLoaded', () => {
    FastClick.attach(document.body)
  }, false)
}
<% } %>

<% if (ctx.mode.cordova) { %>
  <% if (ctx.target.ios) { %>
    // Needed only for iOS
    import FastClick from 'fastclick'
    document.addEventListener('DOMContentLoaded', () => {
      FastClick.attach(document.body)
    }, false)
  <% } %>
document.addEventListener('deviceready', () => {
Vue.prototype.$q.cordova = window.cordova
<% } %>

<% if (hasBootPlugin) { %>
boot({ app, router,<% if (store) { %> store,<% } %> Vue })
<% } else { %>
new Vue(app)
<% } %>

<% if (ctx.mode.cordova) { %>
}, false) // on deviceready
<% } %>


<% } // end of Non SSR %>