import json
import sys
import shutil
from collections import OrderedDict
from operator import itemgetter

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

def compareVersionStrings(str1, str2):
    #print('str1', str1, 'str2', str2)
    vStr1 = str1.split('.')
    vStr2 = str2.split('.')
    
    for index,item in enumerate(vStr1):
        
        if(len(vStr2) >= index):
            if(int(item) > int(vStr2[index])):
                return 1
            elif(int(item) < int(vStr2[index])):
                return -1
        else:
            return 1
    if(len(vStr2) > len(vStr1)):
        return -1
    return 0

print("Start")

#print('compare', compareVersionStrings('0.0.1', '0.0.2'))
#print('compare', compareVersionStrings('0.0.2', '0.0.1'))
#print('compare', compareVersionStrings('0.0.1', '0.0.1'))

parser = argparse.ArgumentParser(description='Build Anti-Pagination.')
parser.add_argument('-v', '-version', default='-1', nargs='?', help='version number')
parser.add_argument('-api', '-apiversion', default='-1', nargs='?', help='api version number')
parser.add_argument('-cp', '-copyfile', default='', nargs='?', help='copy the output to a location')
parser.add_argument('-cp2', '-copyfile2', default='', nargs='?', help='copy the output to a second location')
args = parser.parse_args()

print('cp', args.cp)
print('cp2', args.cp2)
#build.py -v 0.0.6 -api 0.0.4 -cp "C:\Users\Spud\AppData\Roaming\Mozilla\Firefox\Profiles\hatqckbp.Dev\gm_scripts\Anti-Pagination\Anti-Pagination.user.js" -cp2 "C:\Users\Spud\AppData\Roaming\Mozilla\Firefox\Profiles\p9kb0d2b.default\scriptish_scripts\anti-pagination@httpmyuserjsorguserjgjake2\anti-pagination@httpmyuserjsorguserjgjake2.user.js"

onlyfiles = [ f for f in listdir('./src/pageTypes') if isfile(join('./src/pageTypes',f)) ]

print("Page Types: ", onlyfiles)
pageTypes = []
pageTypesStr = ''

output = ''

includeList = []
excludeList = []
requireList = []
historyList = {}
maxNameLen = -1

tFile = ''
with open ('./src/Anti-Pagination.user.js', "r") as myfile:
    tFile=myfile.read()

for m in re.finditer(r"^\/\/\s+\@history\s+\((.*?)\)\s*(.*?)\s*$", tFile, re.MULTILINE + re.IGNORECASE):
    #print('main match', m.group(0))
    if(m.group(1) not in historyList):
        historyList[m.group(1)] = {}
    if('main' not in historyList[m.group(1)]):
        historyList[m.group(1)]['main'] = []
    historyList[m.group(1)]['main'].append(m.group(2))
    tFile = tFile.replace(m.group(0) + "\n", "")

for fileName in onlyfiles:
    print('Processing "'+fileName+'"')
    with open ('./src/pageTypes/' + fileName, "r") as myfile:
      currentFileContent = myfile.read()
      
      thisName = ''
      if(re.search(r'^\/\/\s+\+@typename\s+(.*?)\s*$', currentFileContent, re.MULTILINE + re.IGNORECASE)):
        m=re.match(r'^\/\/\s+\+@typename\s+(.*?)\s*$', currentFileContent, re.MULTILINE + re.IGNORECASE)
        thisName=m.group(1)
        if(len(thisName) > maxNameLen):
            maxNameLen = len(thisName)
        currentFileContent=currentFileContent.replace(m.group(0) + "\n", "")
        #print('thisName', thisName)
        
      for m in re.finditer(r"^\/\/\s+\+\@include\s+(.*?)\s*$", currentFileContent, re.MULTILINE + re.IGNORECASE):
        includeList.append(m.group(1))
        currentFileContent=currentFileContent.replace(m.group(0) + "\n", "")
      for m in re.finditer(r"^\/\/\s+\+\@exclude\s+(.*?)\s*$", currentFileContent, re.MULTILINE + re.IGNORECASE):
        excludeList.append(m.group(1))
        currentFileContent=currentFileContent.replace(m.group(0) + "\n", "")
      for m in re.finditer(r"^\/\/\s+\+\@require\s+(.*?)\s*$", currentFileContent, re.MULTILINE + re.IGNORECASE):
        requireList.append(m.group(1))
        currentFileContent=currentFileContent.replace(m.group(0) + "\n", "")
      for m in re.finditer(r"^\/\/\s+\+\@history\s+\((.*?)\)\s*(.*?)\s*$", currentFileContent, re.MULTILINE + re.IGNORECASE):
        #print('history match', m)
        #print('history match -- version: ', m.group(1), ' -- value: ', m.group(2))
        if(m.group(1) not in historyList):
            historyList[m.group(1)] = {}
        if(thisName not in historyList[m.group(1)]):
            historyList[m.group(1)][thisName] = []
        historyList[m.group(1)][thisName].append(m.group(2))
        currentFileContent=currentFileContent.replace(m.group(0) + "\n", "")
      #fileTypes+=currentFileContent
      pageTypes.append(currentFileContent)
        
includeStr = ''
excludeStr = ''
requireStr = ''
historyStr = ''
historyList2 = {}

for inc in includeList:
    includeStr+="// @include          "+inc+"\n"

for exc in excludeStr:
    excludeStr+="// @exclude          "+exc+"\n"
  
for req in requireList:
    requireStr+="// @require          "+req+"\n"
    
for vers,versVal in historyList.items():
    #print('vers', vers)
    if(vers not in historyList2):
        historyList2[vers] = []
    for name,nameVal in versVal.items():
        for item in nameVal:
            tNameStr = ('(' + name + ')').ljust(maxNameLen + 3, " ")
            historyList2[vers].append(tNameStr + item)


def cmp_to_key(mycmp):
    'Convert a cmp= function into a key= function'
    class K(object):
        def __init__(self, obj, *args):
            self.obj = obj
        def __lt__(self, other):
            return mycmp(self.obj, other.obj) < 0
        def __gt__(self, other):
            return mycmp(self.obj, other.obj) > 0
        def __eq__(self, other):
            return mycmp(self.obj, other.obj) == 0
        def __le__(self, other):
            return mycmp(self.obj, other.obj) <= 0
        def __ge__(self, other):
            return mycmp(self.obj, other.obj) >= 0
        def __ne__(self, other):
            return mycmp(self.obj, other.obj) != 0
    return K

def comp_keys(x, y):
    return compareVersionStrings(x,y)
histKeys = sorted(historyList2, key=cmp_to_key(comp_keys))
histKeys.reverse()

for vNum in histKeys:

    tVersionStr = ("("+vNum+")").ljust(7, " ")
    for tVal in historyList2[vNum]:
        historyStr+="// @history          "+tVersionStr+tVal+"\n"
#print('historyStr\n', historyStr)
#with open ('./src/Anti-Pagination.user.js', "r") as myfile:
    #output=myfile.read().replace('{{{ADD_PAGE_TYPES}}}', fileTypes).replace('{{{INCLUDES}}}\n', includeStr).replace('{{{EXCLUDES}}}\n', excludeStr).replace('{{{REQUIRES}}}\n', requireStr)
pageTypesStr = '\n'.join([str(x) for x in pageTypes])
output=tFile.replace('{{{ADD_PAGE_TYPES}}}', pageTypesStr).replace('{{{INCLUDES}}}\n', includeStr).replace('{{{EXCLUDES}}}\n', excludeStr).replace('{{{REQUIRES}}}\n', requireStr).replace('{{{HISTORY}}}\n', historyStr)

if(args.v != '-1'):
    output = re.sub(r'^(\/\/\s+\@version\s+).*?\s*$', r'\g<1>' + args.v, output, 0, re.MULTILINE + re.IGNORECASE)

if(args.api != '-1'):
  output = re.sub(r'^(\/\/\s+\@require\s+https?:\/\/myuserjs.org\/API/MUJS(?:\.min)?\.js\/).*?\/?\s*$', r'\g<1>' + args.api, output, 0, re.MULTILINE + re.IGNORECASE)

metaBlock = getMetaBlock(output)

#print('metaBlock: ', metaBlock)

minStr = compressString(output, 'WHITESPACE_ONLY', 'ECMASCRIPT5')
    
#minStr = metaBlock + 'if(window.top!=window.self)return;' + minStr
minStr = metaBlock + minStr


with open ('./Anti-Pagination.user.js', "w") as myfile:
    myfile.write(output)

with open ('./Anti-Pagination.min.user.js', "w") as myfile:
    myfile.write(minStr)

if(args.cp != ''):
    shutil.copyfile('./Anti-Pagination.user.js', args.cp)
    
if(args.cp2 != ''):
    shutil.copyfile('./Anti-Pagination.user.js', args.cp2)
    
print("Done")
