import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="empty-page">
      <h1>Kiitos tilauksesta!</h1>
      <p>
        Tilausnumero <strong>#{id}</strong> on vahvistettu. Tervetuloa
        uudelleen!
      </p>
      <Link to="/">Takaisin etusivulle</Link>
    </div>
  );
}
