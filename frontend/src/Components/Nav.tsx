import React from 'react'

export default function Nav() {
  return (
    <nav>
      <h1>
        <a href="/">Khalil Sfouk</a>
      </h1>
      <ul>
        <li className="menu-item">
          <a href="/">Hjem</a>
        </li>
        <li className="menu-item">
          <a href="/porsjekter">Prosjekter</a>
        </li>
        <li className="menu-item">
          <a href="/Kontakt">Kontakt</a>
        </li>
      </ul>
    </nav>
  );
}
