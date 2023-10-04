# Script for getting envs required to run the project locally
# RUN it from root directory of the project or directly from package.json
# in root use `run get-envs` or `./scripts/get-envs.sh`

borrowDir=$(basename "$(pwd)")
cd ..
git clone git@github.com:OasisDEX/borrow-envs.git 'temp-envs'
cd temp-envs
echo "Pulling latest changes..."
git pull
cp .env ../${borrowDir}/.env
cd ..
echo "Cleaning up..."
rm -rf temp-envs
echo "Done!"

