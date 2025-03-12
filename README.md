# Installation
```
git clone <repo>
cd <repo>
yarn install
cp .env.example .env
yarn db:start
yarn dev
```

# Run app
```
yarn dev
```

# MongoDB container
```
docker-compose up -d
docker-compose down
docker logs -f mongo_db
docker exec -it mongo_db mongosh -u admin -p secret --authenticationDatabase admin
```