imagename=testable-microservices
docker-compose-test-cmd=docker compose -f ./docker-compose.integration.test.yml

.PHONY: docker-build

docker-build:
	@docker build --target=dev -t $(imagename) .
	@docker build --target=test-runner -t $(imagename)-test-runner .

integration-test: docker-build
	@$(docker-compose-test-cmd) up --build --force-recreate --remove-orphans # --abort-on-container-exit && $(docker-compose-cmd) down

run:
#@docker network create sharednet
	@docker compose up --build --remove-orphans --abort-on-container-exit --force-recreate
