# Decisions taken, but pending of review
- Docker should be installed to run the complete service, I have to include a quick disclaimer and justify it
  
<br/>
<br/>
<br/>

# Installation
```
git clone <repo>
cd <repo>
yarn install
cp .env.example .env
yarn db:start
yarn dev
```
  
<br/>
<br/>
<br/>

# Run app
```
yarn db:start
yarn redis:start
yarn dev
```

# Admitted types for each mapping field
- Primitives: String, Number, Boolean
- Arrays: Array<String>, Array<Number>, Array<Boolean>
- Complex types: Object, Date
- JSON parsing: JSON (para cualquier objeto JSON)
- For this first version, these are the only types accepted, fon enhancing, you should modify only `/src/utils/parseMapping.ts` or replace it with another mapping function
- Mapping function can be way more modular and efficient
