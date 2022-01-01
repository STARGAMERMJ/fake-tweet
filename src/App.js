import React, { useState, createRef, useEffect } from 'react';
import './style.scss';

import {
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ShareIcon,
  VerifiedIcon,
} from './icons';
import { useScreenshot } from 'use-react-screenshot';
import { AvatarLoader } from './loaders';
import { language } from './languages';

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

const tweetFormat = (tweet) => {
  tweet = tweet
    .replace(/@([\w]+)/g, '<span>@$1</span>')
    .replace(/#([\wşçöğüıiİ]+)/gi, '<span>#$1</span>')
    .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>');
  return tweet;
};

const fotmatNumber = (number) => {
  if (!number) {
    return (number = 0);
  }
  if (number < 1000) {
    return number;
  } else {
    number /= 1000;
    number = String(number).split('.');
    return (
      number[0] + (number[1] > 100 ? ',' + number[1].slice(0, 1) + 'B' : 'B')
    );
  }
};

export default function App() {
  const [lang, setLang] = useState('tr');
  const [langText, setLangText] = useState();
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [isVerified, setIsVerified] = useState(0);
  const [tweet, setTweet] = useState();

  const [retweets, setRetWeets] = useState();
  const [quoteTweets, setQuoteTweets] = useState();
  const [likes, setLikes] = useState();
  const [avatar, setAvatar] = useState();

  const tweetRef = createRef(null);
  const downloadRef = createRef();
  const [image, takeScreenshot] = useScreenshot();
  const getImage = () => takeScreenshot(tweetRef.current);

  useEffect(() => {
    setLangText(language[lang]);
  }, [lang]);

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  const avatarHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${userName}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0];

        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image);
          }
        );

        setName(twitter.name);
        setUserName(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetWeets(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };
  return (
    <>
      <div className="tweet-settings">
        <h3>{langText?.settings}</h3>
        <ul>
          <li>
            <label>{langText?.name}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="input"
            />
          </li>
          <li>
            <label>{langText?.username}</label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              type="text"
              className="input"
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              className="textarea"
              maxLength="290"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
            />
          </li>
          <li>
            <label>Avatar</label>
            <input onChange={avatarHandle} type="file" className="input" />
          </li>
          <li>
            <label>Retweet</label>
            <input
              type="number"
              className="input"
              value={retweets}
              onChange={(e) => setRetWeets(e.target.value)}
            />
          </li>
          <li>
            <label>Alıntı Tweetler</label>
            <input
              type="number"
              className="input"
              value={quoteTweets}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label>Beğeni</label>
            <input
              type="number"
              className="input"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>Doğrulanmış Hesap</label>
            <select
              value={isVerified}
              onChange={(e) => setIsVerified(e.target.value)}
            >
              <option value="1">Evet</option>
              <option value="0">Hayır</option>
            </select>
          </li>
          <button onClick={getImage}>Oluştur</button>
          <div className="download-url">
            {image && (
              <a href={image} ref={downloadRef} download={'tweet.png'}>
                Tweeti İndir
              </a>
            )}
          </div>
        </ul>
      </div>

      <div className="tweet-container">
        <div className="app-languages">
          <span
            className={lang === 'tr' ? 'active' : null}
            onClick={() => setLang('tr')}
          >
            Türkçe
          </span>
          {console.log(lang)}
          <span
            className={lang === 'en' ? 'active' : null}
            onClick={() => setLang('en')}
          >
            English
          </span>
        </div>

        <div className="fetch-info">
          <input
            type="text"
            value={userName}
            placeholder="Tweeter Kullanıcı Adını Yazınız"
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>

        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} />) || <AvatarLoader />}

            <div>
              <div className="name">
                {name || 'Ad-Soyad'}
                {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className="username">@{userName || 'Kullanici Adı'}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  (tweet && tweetFormat(tweet)) ||
                  'Bu alana örnek tweet konulacaktır',
              }}
            >
              {}
            </p>
          </div>
          <div className="tweet-stats">
            <span>
              <b>{fotmatNumber(retweets)}</b>Retweet
            </span>
            <span>
              <b>{fotmatNumber(quoteTweets)}</b>Alıntı Tweetler
            </span>
            <span>
              <b>{fotmatNumber(likes)}</b>Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
