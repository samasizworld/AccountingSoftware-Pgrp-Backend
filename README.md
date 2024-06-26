
# Docker CLI
<!-- to see stopped container --> 
docker container ls -a 
<!-- to see running container --> 
docker container ls 
<!-- to see images --> 
docker image ls
<!-- to remove image --> 
docker image rm -f <image_name>
<!-- docker run container --> 
docker run --name <container_name> -d -p <publicportofcontainer>:<privateportofcontainer> <image_name>
<!-- docker build image --> 
docker build -t <image_name:version> <pathtoappfile>
<!-- remove all  stop container  --> 
docker container prune
<!-- go inside container --> 
docker exec -it <container_name> <command>

docker logs <container_name>


# user-api
docker build -t userimage . <br /> 

docker run --name userapi -d -p 3001:3000 userimage <br />

docker exec -it userapi sh <br />


# account-api
docker build -t accountimage . <br />
docker run --name accountapi -d -p 4001:4000 accountimage <br />
docker exec -it accountapi sh  <br />

# credential-api
docker build -t credentialimage . <br />
docker run --name credentialapi -d -p 5001:5000 credentialimage <br />
docker exec -it credentialapi sh <br />

# Docker-Compose in JSON
docker-compose config <br/>
docker-compose -f <file_name> up -d <br/>
e.g docker-compose -f dockercompose.json up -d

# Docker Volume
docker volume ls

docker volume inspect <volume_name>

# Docker Network
docker network ls
docker network create --driver=bridge -o "com.docker.network.bridge.name=<docker_network_interface_name>" --subnet=<ipv4/hostbit> <network_name> <br/>
docker network create --driver=bridge -o "com.docker.network.bridge.name=p_interface" --subnet=172.168.0.0/16 pnetwork <br/>
docker network inspect pnetwork

