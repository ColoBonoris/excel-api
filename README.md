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
yarn dev
```
  
<br/>
<br/>
<br/>

# MongoDB container
```
docker-compose up -d
docker-compose down
docker logs -f mongo_db
docker exec -it mongo_db mongosh -u admin -p secret --authenticationDatabase admin
```
  
<br/>
<br/>
<br/>
