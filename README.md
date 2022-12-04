# Deploy Heroku
Prod Build Frontend = npm run build
Move build folder to Backend

# If Git not Initialize
git init
heroku git:remote -a githubrepositoryanalysis 

git add .
git commit -m "Make better"
git push heroku master

# For See Heroku Logs
1. heroku logs --tail