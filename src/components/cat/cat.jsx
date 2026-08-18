/**
 * Cat component renders a decorative cat illustration using CSS.
 * 
 * The source for this component is from: https://codepen.io/ashleynolan/pen/mdxBpZ
 * 
 */
import React from 'react'
import './cat.css'

function Cat () {
  return (
    <div className='cat-art' aria-label='Decorative cat'>
      <div className='cat-art__body cat-art__body--slant cat-art__body--ears'>
        <div className='cat-art__face' />
        <div className='cat-art__features' />
      </div>
    </div>
  )
}

export default Cat
