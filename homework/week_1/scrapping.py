#!/usr/bin/env python
# Name: Frederik van Veen
# Student number: 10789324
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'

class Movie:
  def __init__(self, title, rating, year, actors_directors, runtime):
    self.title = title
    self.rating = rating
    self.year = year
    self.actors_directors = actors_directors
    self.runtime = runtime

  def __str__(self):
        return self.title +'\n' + self.rating +'\n' + self.year

def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    movies = []

    # find information for all movies
    information_movies = dom.findAll("div",{"class":"lister-item-content"})

    for information_movie in information_movies:

        # aquire title
        title = information_movie.h3.a.text
        title = title.encode('ascii', 'ignore')

        # aquite rating without point at end
        rating = float(information_movie.div.div.strong.text)

        # aquire year without brackets and roman numerals
        year = information_movie.h3.findAll('span', {'class':'lister-item-year text-muted unbold'})[0].text
        year = int(year[len(year)-5:len(year)-1])

        actors_directors_string = information_movie.findAll('p')[2].text
        # actors_directors_string = actors_directors_string.replace('Director:','')
        # actors_directors_string = actors_directors_string.replace('Directors:','')
        # actors_directors_string = actors_directors_string.replace('Stars:','')
        # actors_directors_string = actors_directors_string.replace('|','')
        # actors_directors_string = actors_directors_string.replace('\n',',')

        # counter to distinguish two colons
        col_count = 0
        for i in  range(len(actors_directors_string)):
            if actors_directors_string[i] == ':':
                if col_count == 0:
                    # index of first colon
                    first_col_index = i
                    col_count += 1
                else:
                    # index of second colon
                    second_col_index = i
            # seperation sign for directors and actors
            if actors_directors_string[i] == '|':
                dir_act_sep_index = i


        # directors string
        directors = actors_directors_string[first_col_index + 1 : dir_act_sep_index-1].encode('ascii', 'ignore') + ', '
        # actors string
        actors = actors_directors_string[second_col_index + 1 : len(actors_directors_string)].encode('ascii', 'ignore')

        actors_directors = directors  + actors
        actors_directors = actors_directors.replace('\n','')
        print actors_directors

        runtime = information_movie.findAll('p', {'class':'text-muted '})[0].findAll('span', {'class':'runtime'})[0].text
        for i in range(len(runtime)):
            if runtime[i] == ' ':
                space_index = i
                break

        runtime = int(runtime[0:i])
        movie = Movie(title, rating, year, actors_directors, runtime)
        movies.append(movie)


    return movies


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    for movie in movies:
        writer.writerow([movie.title, movie.rating, movie.year, movie.actors_directors, movie.runtime])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE MOVIES TO DISK


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    movies =  extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w') as output_file:
        save_csv(output_file, movies)
