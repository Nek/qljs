# QLJS &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Nek/qljs/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/qljs.svg?style=flat)](https://www.npmjs.com/package/qljs) [![codecov](https://codecov.io/gh/Nek/qljs/branch/master/graph/badge.svg)](https://codecov.io/gh/Nek/qljs) [![Build Status](https://travis-ci.org/Nek/qljs.svg?branch=master)](https://travis-ci.org/Nek/qljs)

# QLJS

Querying of data for UI on top of React.

## Features

- Minimalistic Query Language built with standard JS data structures (hence QLJS).

  From the family of graph query languages comes a new contender in shiny armor.
  He's going to free the world of JS UIs from the darkness of last ages.

- Isolation of UI specific derived data from app state and logic.

  The problem is your UI needs one kind of data and you app needs another one.
  The shape of UI data in React is a tree. Data flows from top to the bottom of components' hierrachy.
  The shape of the actual application is usually very different: lists, maps, crosslinks by id or even a database.
  Situation is bad when the shape of UI data leaks into the rest of the app and vice versa.
  QLJS alleviates this problem.

- Built-in facilities for optimistic updates with following server syncronization.

- Backend agnostic.

- Can be used on backend to simplify overall architecture

## Process

1. Decorate components with queries
2. Write parsers to understand the queries
  - read - get data from state
  - mutate - update data in state
  - remote - provide data for remote calls handler
  - sync - integrate the servers response into the state

## Getting started

## Scripts

* `yarn build` or `npm run build` - produces production version of your library under the `lib` folder
* `yarn dev` or `npm run dev` - produces development version of your library and runs a watcher
* `yarn test` or `npm run test` - well ... it runs the tests :)
* `yarn test:watch` or `npm run test:watch` - same as above but in a watch mode

## Readings

## Misc
