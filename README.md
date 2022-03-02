# Vellorum 

> ReactJS, TypeScript, GraphQL, Apollo Client

## Installation Guide
```
# clone repository

# install dependencies
$ yarn

# copy and modify the .env.example to .env

$ cd React-Boilerplate

# start 
$ yarn start

```

> Note: Use yarn as package manager.

## Create Build

```
$yarn build
```

## Antd
- Uses antd for the design system

### Customization

Install less and lessc globally
`$sudo npm i -g less lessc`

Cmd: `lessc` is used to compile the src/App/antd.less to css file in order to override the antd variables.

`$ lessc src/App/antd.less src/App/antd.css --js`
