import glob
import os
import re
import sys
import timeit
import json
import requests
import requests_cache
import urllib.request
from datetime import datetime
#from MediaInfo import MediaInfo

def num(s):
	try:
		return int(s)
	except ValueError:
		try:
	 		return float(s)
		except ValueError:
	 		return 0

def imdbRating(moviesInfoArray):
	try:
		return num(moviesInfoArray['imdbRating'])
	except KeyError:
		return 0

def releaseDate(moviesInfoArray):
	try:
		return num(moviesInfoArray['Year'])
	except KeyError:
		return 0

def renam(name):													#converts naame to searchable format
	string=name.replace("'","")
	string=string.replace("-","_")
	string = re.sub(r'[^A-Za-z0-9]', '_',string)						#replace special characters with _
	string = re.sub('(^_)([A-Z]+)', r'\1_\2', string).lower()		#convert CamelCase to underscore
	#print(string)
	return string

def request(string):
	original=string
	while True:
		#print(string)
		url='https://v2.sg.media-imdb.com/suggests/'+string[0]+'/'+string+'.json'
		page = requests.get(url)
		trimmed=page.text[6+len(string):-1]
		jso=json.loads(trimmed)
		if('d' in jso ):
			#if(str(jso['d'][0]['q'])=="feature"):								#only if a feature film
			if('id' in jso['d'][0]):
				movieID=jso['d'][0]['id']
				#print(movieID)
				return movieID
		else:
			print(jso)
		last_=string.rfind('_')
		string=string[:last_]	
		print(string)												#search for last _ and remove last word
		if(len(string)<=1):
			print(original+'movie not found')
			raise Exception(original+'movie not found')

def download_posters(moviesInfoArray):
	for movie in moviesInfoArray:
		try:
			print("Downloading poster for "+movie["Title"])
			urllib.request.urlretrieve(movie["Poster"],'Movies/MoviesInfo/Movies_posters/'+(movie["Title"]+'_'+movie["Year"])+".jpg")
		except Exception as e:
			print(e)
			print(movie["Title"])

def download_subtitles(moviesInfoArray):
	for movie in moviesInfoArray:
		try:
			print("Downloading Subtitle for "+movie)	
		except Exception as e:
			print(e)
			print(movie["Title"])

def write_to_file(moviesInfoArray,file):
	outfile=open('Movies/MoviesInfo/'+file+'.jsonp', 'w')
	outfile.write(file+"=")
	json_string=json.dumps(moviesInfoArray)
	outfile.write(json_string)
	outfile.close()

def main():
	start = timeit.default_timer()							#code starts running here, calculting run time
	requests_cache.install_cache(cache_name='imdb_cache', backend='sqlite', expire_after=60000)
	
	if(len(sys.argv)>1):
		folder=sys.argv[1]
	else:
		print('using default folder:"Movies"')
		folder='Movies'
	dire=folder+'/**/*.'														
	types = (dire+'mp4', dire+'mkv',dire+'avi',dire+'wmv',dire+'flv',dire+'webm') # the tuple of file types
	names = []
	moviesInfoArray=[]
	for files in types:
	    names.extend(glob.glob(files,recursive=True))
	if not os.path.exists('Movies'):
		os.makedirs('Movies')
	if not os.path.exists('Movies/MoviesInfo'):
		os.makedirs('Movies/MoviesInfo')
	if not os.path.exists('Movies-noDetailFound'):
		os.makedirs('Movies-noDetailFound')
	for i in names:
		try:
			size=os.path.getsize(i)/(1024*1024)
			if(size<200):
				continue
			fileName=os.path.basename(i)
			extension=fileName[-3:]
			string=renam(fileName[:-4])
			movieID=request(string)

			movieInfo = requests.get('http://www.omdbapi.com/?i='+movieID+'&plot=short').json()
			if(movieInfo["Rated"]=="R"):
				movieInfo["Rated"]="18+"
			elif(movieInfo["Rated"]=='PG-13'):
				movieInfo["Rated"]="13+"
			else:
				movieInfo["Rated"]=""
			
			#newName=movieInfo["Title"]+'_'+movieInfo["Year"]
			#location='Movies/'+newName+'.'+extension
			#os.rename(i,location)
			#movieInfo["Location"]=newName+'.'+extension
			movieInfo["Size"]=str(int(size))+'MB'
			movieInfo["Location"]=i
			movieInfo["Filename"]=fileName[:-4]
			movieInfo["Extension"]=extension
			moviesInfoArray.append(movieInfo)
		except Exception as e:
			print(e)
			location=os.path.basename(i)
			os.rename(i,'Movies-noDetailFound/'+location)

	moviesInfoArray.sort(key=imdbRating, reverse=True)

	counter=0
	for movie in moviesInfoArray:
		movie["ID"]=counter
		counter+=1

	write_to_file(moviesInfoArray,'metadataByRating')

	genreDict={}
	for movie in moviesInfoArray:
		for genre in movie["Genre"].split(', '):
			if genre not in genreDict:
				genreDict[genre]=[]
			genreDict[genre].append(movie["ID"])
	print(genreDict)
	write_to_file(genreDict,'genre')


	moviesInfoArray.sort(key=releaseDate, reverse=True)
	#sorted_date = sorted(moviesInfoArray, key=lambda x: datetime.strptime(x['Date'], '%d %b %Y'))
	write_to_file(moviesInfoArray,'metadataByDate')

	#download_posters(moviesInfoArray)
	#download_subtitles(moviesInfoArray)
	
	if not os.listdir('Movies-noDetailFound'):
	    os.rmdir('Movies-noDetailFound')

	print (str(len(names))+"movies in"+str(timeit.default_timer() - start)+"seconds")
	#write HTML file and open it 


if __name__ == '__main__':
	main()