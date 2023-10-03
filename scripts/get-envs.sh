# Script for getting envs required to run the project locally
# RUN it from root directory of the project or directly from package.json
# in root use `run get-envs` or `./scripts/get-envs.sh`

borrowDir=$(basename "$(pwd)")
cd ..
if [ ! -d "borrow-envs" ]; then
  echo "Directory borrow-envs doesn't exist, cloning..."
  git clone git@github.com:OasisDEX/borrow-envs.git
fi
cd borrow-envs
echo "Pulling latest changes..."
git pull
cp .env ../${borrowDir}/.env
