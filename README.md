# text-processor #

An implementation of a text processor based on the specified requirements.

## View app ##

You can view the app runnning live at [http://text-processor.herokuapp.com](http://text-processor.herokuapp.com)

## AlchemyAPI ##

>AlchemyAPI offers artificial intelligence as a service. We teach computers to learn how to read and see, and apply our technology to >text analysis and image recognition through a cloud-based API. Our customers use AlchemyAPI to transform their unstructured content >such as blog posts, news articles, social media posts and images into much more useful structured data. 
>
>AlchemyAPI is a tech startup located in downtown Denver, Colorado. As the world’s most popular text analysis service, AlchemyAPI >serves over 3.5 billion monthly API requests to over 35,000 developers. To enable our services, we use artificial intelligence, >machine learning, neural networks, natural language processing and massive-scale web crawling. Our technology powers use cases in a >variety of industry verticals, including social media monitoring, business intelligence, content recommendations, financial trading >and targeted advertising.

>More information at: http://www.alchemyapi.com

## Prerequisites ##

This app uses NodeJS and Express for the backend.
If you don't have NodeJS installed go to [https://nodejs.org/en/](https://nodejs.org/en/) to get a copy.
In order to use this example you also need to get an API key from [Alchemy](http://www.alchemyapi.com/api/register.html)

## Installation ##

Run the following commands inside a terminal to get the app up & running:
```bash
git clone https://github.com/ColdFire87/text-processor.git
$ cd text-processor
npm install
node alchemyapi.js YOUR_ALCHEMY_KEY_HERE
node app.js
```

Go to [http://localhost:3000](http://localhost:3000) to see the app running.

You can use the sample input in `text.txt` to test the app.

## Contributions ##

This project is not being actively maintained. If you wish to contribute fork the repository and add the changes to your own forked repo.
