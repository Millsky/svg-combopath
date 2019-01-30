# svg-combopath
a totally nifty converter that takes an svg file, strips it down to the bare minimum and makes fun of it before building it back up and spitting out a combined path's "d" value

# usage

```
import eez from '@vibrent/svg-combopath';

// React Component stuff continues... then in your render() method...

render() {
  <svg 
    {...props}
    width={props.size}
    height={props.size}
    >
      <path d={eez[props.name]} />
  </svg>
}
```
