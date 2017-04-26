CURRENT_DIR=`pwd`/example/keys/

# RS256
# private key
openssl genrsa -out ${CURRENT_DIR}rs256-4096-private.rsa 4096
# public key
openssl rsa -in ${CURRENT_DIR}rs256-4096-private.rsa -pubout > ${CURRENT_DIR}rs256-4096-public.pem

# ES512
# private key
openssl ecparam -genkey -name secp521r1 -noout -out ${CURRENT_DIR}ecdsa-p521-private.pem
# public key
openssl ec -in ${CURRENT_DIR}ecdsa-p521-private.pem -pubout -out ${CURRENT_DIR}ecdsa-p521-public.pem 