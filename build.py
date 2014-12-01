import json
import sys
 
try: # Py3
  from urllib.parse import urlencode
  from urllib.request import urlopen
  from urllib.request import Request
except ImportError: # Py2
  from urllib import urlencode
  from urllib2 import urlopen
  from urllib2 import Request

from os import listdir
from os.path import isfile, join
import re
import argparse

def getMetaBlock(inputStr):
    inMetaBlock = False
    metaBlock = '';
    for line in inputStr.splitlines():
        if(inMetaBlock == False):
            if(re.search(r'\/\/\s+==UserScript==', line)):
                metaBlock+=line+'\n'
                inMetaBlock = True
        else:
            metaBlock+=line+'\n'
            if(re.search(r'\/\/\s+==\/UserScript==', line)):
                inMetaBlock = False
                break
    return metaBlock

def compressString(content, level='WHITESPACE_ONLY', language='ECMASCRIPT5'):

    params = [
        ('js_code', content),
        ('compilation_level', level),
        ('output_format', 'text'),
        #('output_wrapper', '(function() {%output%})();'),
        ('output_info', 'compiled_code'),
        ('output_info', 'errors'),
        #('warning_level', 'QUIET'),
        ('language', language),
      ]
        
    data = urlencode(params).encode('utf-8')

    req = Request('https://closure-compiler.appspot.com/compile')
    req.add_header('Content-type', 'application/x-www-form-urlencoded;charset=utf-8')
    r = urlopen(req, data)
    if r.getcode() != 200:
      raise Exception('response status was: ' + r.status)
    return r.read().decode('utf-8')

print("Start")

parser = argparse.ArgumentParser(description='Build Anti-Pagination.')
parser.add_argument('-v', '-version', default='-1', nargs='?', help='version number')
args = parser.parse_args()

onlyfiles = [ f for f in listdir('./src/pageTypes') if isfile(join('./src/pageTypes',f)) ]

print("Page Types: ", onlyfiles)
fileTypes = ''

output = ''

for fileName in onlyfiles:
    with open ('./src/pageTypes/' + fileName, "r") as myfile:
        fileTypes+=myfile.read()

with open ('./src/Anti-Pagination.user.js', "r") as myfile:
    output=myfile.read().replace('{{{ADD_PAGE_TYPES}}}', fileTypes)

if(args.v != '-1'):
    output = re.sub(r'^(\/\/\s+\@version\s+).*?\s*$', r'\g<1>' + args.v, output, 0, re.MULTILINE)


metaBlock = getMetaBlock(output)

#print('metaBlock: ', metaBlock)

minStr = compressString(output, 'WHITESPACE_ONLY', 'ECMASCRIPT5')
    
#minStr = metaBlock + 'if(window.top!=window.self)return;' + minStr
minStr = metaBlock + minStr


with open ('./Anti-Pagination.user.js', "w") as myfile:
    myfile.write(output)

with open ('./Anti-Pagination.min.user.js', "w") as myfile:
    myfile.write(minStr)

print("Done")
