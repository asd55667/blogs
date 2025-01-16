# 正则regex.h

> > 记录了C语言中正则的使用

正则表达式，以特定的pattern来匹配字符串中的子串
```C
#include <regex.h>
#include <stdio.h>


int main(){
    char *source = "___ abc123def __<a href=\"www.baidu.com\">_ ghi456 ___";
    char *pattern = "<a (href=(\")([a-z]+\.[a-zA-z0-9]+\.[a-zA-Z0-9]+)\")(>)";
    // num matches
    size_t maxMatches = BUFSIZ;
    // num sub matches ()
    size_t maxGroups = 2;
    
    // reg info
    regex_t regexCompiled;
    // start and end markup
    regmatch_t groupArray[maxGroups];
    // init regexp
    if(regcomp(&regexCompiled, pattern, REG_EXTENDED)){
      perror("could't compile regexp");
      return 1;
    }
  
    char *cursor = source;
    for(size_t m = 0; m < maxMatches; m++){
      // match outlet
      if(regexec(&regCompiled, cursor, maxGroups, groupArray, 0))
        break;
      
      size_t offset = 0;
      for(size_t g = 0; g < maxGroups; g++){
        // group outlet
        if(groupArray[g].rm_so == (size_t)-1)
          break;
        // reset markup
        if(g == 0)
          offset = groupArray[g].rm_eo;
        
        char cursorCopy[strlen(cursor) + 1];
        strcpy(cursorCopy, cursor);
        cursorCopy[groupArray[g].rm_eo] = 0;
        fprintf(stdout, "m %u g %u pos[%u-%u]: %s\n",
               m, g, groupArray[g].rm_so, groupArray[g].rm_eo,
               cursorCopy + groupArray[g].rm_so);
      }
      cursor += offset;
    }
    regfree(&regCompiled);
    getchar();
    return 0;
}
```

`group`数目与`pattern`中`()`相关联，可嵌套`(())`，可并列`()()`

<!-- 2020年6月13日 16:12 -->