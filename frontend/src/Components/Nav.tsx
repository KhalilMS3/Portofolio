import React from 'react'

export default function Nav() {
  return (
    <nav>
      <h1>
        <a href="./index.html">Kha.dev</a>
      </h1>
      <ul>
        <li className="menu-item">
          <a href="#">Hjem</a>
        </li>
        <li className="menu-item">
          <a href="#">Prosjekter</a>
        </li>
        <li className="menu-item">
          <a href="#">Kontakt</a>
        </li>
      </ul>
    </nav>
  );
}
