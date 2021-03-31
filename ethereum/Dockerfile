# Builder container
FROM golang:alpine as builder

# Add C compiler
RUN apk add --no-cache make gcc musl-dev linux-headers git

# Add source files to container
ADD . /out

# Go to build dir and build geth
RUN cd /out && make clean geth


# Deployment container
FROM alpine:latest

# Copy builded app
COPY --from=builder /out/build/bin/geth /usr/local/bin/

EXPOSE 8545 8546 30303 30303/udp
ENTRYPOINT ["geth"]
